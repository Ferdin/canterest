import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
    setHistoryState,
    triggerUndo,
    triggerRedo,
    setLayers,
    setActiveLayer,
    setActiveTool,
    setTextStyle,
    type LayerInfo,
    type TextStyle,
    setExportedImage,
} from "../../../features/canvas/canvasSlice";
import "./index.css";

type Point = { x: number; y: number };

// x, y are the text's center as fractions (0–1) of the artboard.
type TextData = TextStyle & { text: string; x: number; y: number };
type ImageLayerData = { src: string; x: number; y: number; width: number; aspect: number};

type DrawLayer = { kind: "draw"; canvas: HTMLCanvasElement };
type TextLayer = { kind: "text"; el: HTMLDivElement; data: TextData };
type ImageLayer = { kind: "image"; el: HTMLDivElement; img: HTMLImageElement; data: ImageLayerData};
type Layer = DrawLayer | TextLayer | ImageLayer;

type LayerSnapshot =
    | { kind: "draw"; image: HTMLCanvasElement }
    | { kind: "text"; data: TextData }
    | { kind: "image"; data: ImageLayerData };

type ElementDrag = {
    id: number;
    pointerId: number;
    mode: "move" | "resize";
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origWidth: number;
    before: LayerSnapshot;
    moved: boolean;
}    


type LayerChange = {
    layerId: number;
    before: LayerSnapshot | null; // null = layer didn't exist yet
    after: LayerSnapshot | null;  // null = layer was removed
};

type HistoryEntry = {
    changes: LayerChange[];
    orderBefore: number[];
    orderAfter: number[];
    mergeKey?: string;
    time: number;
};

type EditSession = { id: number; before: LayerSnapshot | null; orderBefore: number[] };

const MAX_HISTORY = 30;
const THUMB_WIDTH = 96;
const MERGE_WINDOW_MS = 1000;
const DEFAULT_TEXT = "Add text";

const EXPORT_SCALE = 2;
const TEXT_PAD_X = 8;
const TEXT_PAD_Y = 4;
const TEXT_LINE_HEIGHT = 1.2;

const MIN_IMAGE_PX = 24;
const HANDLE_SIZE = 14;

const copyCanvas = (source: HTMLCanvasElement) => {
    const copy = document.createElement("canvas");
    copy.width = source.width;
    copy.height = source.height;
    copy.getContext("2d")?.drawImage(source, 0, 0);
    return copy;
};

const makeThumbnail = (layer: HTMLCanvasElement) => {
    if (layer.width === 0 || layer.height === 0) return "";
    const thumb = document.createElement("canvas");
    thumb.width = THUMB_WIDTH;
    thumb.height = Math.max(1, Math.round(layer.height * (THUMB_WIDTH / layer.width)));
    thumb.getContext("2d")?.drawImage(layer, 0, 0, thumb.width, thumb.height);
    return thumb.toDataURL("image/png");
};

const sameOrder = (a: number[], b: number[]) =>
    a.length === b.length && a.every((id, i) => id === b[i]);

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const snapshotLayer = (layer: Layer): LayerSnapshot => {
    switch (layer.kind) {
        case "draw":
            return { kind: "draw", image: copyCanvas(layer.canvas) };
        case "text":
            return { kind: "text", data: { ...layer.data } };
        case "image":
            return { kind: "image", data: { ...layer.data } };
    }
};

const layerNode = (layer: Layer) => (layer.kind === "draw" ? layer.canvas : layer.el);

const pickTextStyle = (data: TextData): TextStyle => ({
    fontFamily: data.fontFamily,
    fontSize: data.fontSize,
    color: data.color,
    align: data.align,
});

const sameTextStyle = (a: TextStyle, b: TextStyle) =>
    a.fontFamily === b.fontFamily &&
    a.fontSize === b.fontSize &&
    a.color === b.color &&
    a.align === b.align;

const setEditable = (el: HTMLDivElement, editable: boolean) => {
    if (editable) {
        // plaintext-only keeps pasted formatting out; older browsers fall back to true.
        try {
            el.contentEditable = "plaintext-only";
        } catch {
            el.contentEditable = "true";
        }
    } else {
        el.contentEditable = "false";
    }
    const select = editable ? "text" : "none";
    el.style.cursor = editable ? "text" : "move";
    el.style.userSelect = select;
    el.style.setProperty("-webkit-user-select", select);
};

const selectAllText = (el: HTMLElement) => {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(el);
    selection?.removeAllRanges();
    selection?.addRange(range);
};

const drawTextLayer = (
    ctx: CanvasRenderingContext2D,
    data: TextData,
    width: number,
    height: number
) => {
    const lines = data.text.split("\n");

    ctx.save();
    ctx.font = `${data.fontSize}px ${data.fontFamily}`;
    ctx.fillStyle = data.color;
    ctx.textBaseline = "middle";
    ctx.textAlign = data.align;

    const lineHeight = data.fontSize * TEXT_LINE_HEIGHT;
    const textWidth = Math.max(...lines.map((line) => ctx.measureText(line).width));
    const boxWidth = textWidth + TEXT_PAD_X * 2;
    const boxHeight = lines.length * lineHeight + TEXT_PAD_Y * 2;

    const cx = data.x * width;
    const cy = data.y * height;
    const left = cx - boxWidth / 2;
    const top = cy - boxHeight / 2;

    const x =
        data.align === "left" ? left + TEXT_PAD_X
        : data.align === "right" ? left + boxWidth - TEXT_PAD_X
        : cx;

    lines.forEach((line, i) => {
        ctx.fillText(line, x, top + TEXT_PAD_Y + lineHeight * (i + 0.5));
    });

    ctx.restore();
}

export default function Canvas() {
    const dispatch = useAppDispatch();

    const areaRef = useRef<HTMLDivElement>(null);
    const layersRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null);
    const cursorRef = useRef<HTMLDivElement>(null);

    const elementDragRef = useRef<ElementDrag | null>(null);

    const layerMapRef = useRef(new Map<number, Layer>());
    const layerOrderRef = useRef<number[]>([]); // bottom → top
    const activeLayerIdRef = useRef<number | null>(null);
    const nextLayerIdRef = useRef(1);

    const isDrawingRef = useRef(false);
    const pointsRef = useRef<Point[]>([]);
    const pendingBeforeRef = useRef(new Map<number, LayerSnapshot | null>());
    const pendingOrderBeforeRef = useRef<number[]>([]);

    const editSessionRef = useRef<EditSession | null>(null);
    const pendingCreateRef = useRef<Point | null>(null);

    const historyRef = useRef<HistoryEntry[]>([]);
    const historyIndexRef = useRef(0);

    const addImagesRequest = useAppSelector((state) => state.canvas.addImagesRequest);

    const color = useAppSelector((state) => state.canvas.color);
    const brushSize = useAppSelector((state) => state.canvas.brushSize);
    const brushStyle = useAppSelector((state) => state.canvas.brushStyle);
    const opacity = useAppSelector((state) => state.canvas.opacity);
    const clearTrigger = useAppSelector((state) => state.canvas.clearTrigger);
    const undoTrigger = useAppSelector((state) => state.canvas.undoTrigger);
    const redoTrigger = useAppSelector((state) => state.canvas.redoTrigger);
    const activeLayerId = useAppSelector((state) => state.canvas.activeLayerId);
    const backgroundColor = useAppSelector((state) => state.canvas.backgroundColor);
    const layerOrderRequest = useAppSelector((state) => state.canvas.layerOrderRequest);
    const activeTool = useAppSelector((state) => state.canvas.activeTool);
    const textStyle = useAppSelector((state) => state.canvas.textStyle);
    const addTextTrigger = useAppSelector((state) => state.canvas.addTextTrigger);

    const isDrawTool = activeTool === "draw";
    const isTextTool = activeTool === "text";
    const cursorDiameter = Math.max(4, brushStyle === "spray" ? brushSize * 2 : brushSize);

    const exportTrigger = useAppSelector((state) => state.canvas.exportTrigger);
    const exportUrlRef = useRef<string | null>(null);

    const exportImage = async (): Promise<string | null> => {
        const overlay = overlayRef.current;
        if (!overlay) return null;

        // The editor is already hidden when this runs (it measures 0×0),
        // so use the overlay's stored size instead of measuring.
        const width = overlay.width;
        const height = overlay.height;
        if (!width || !height) return null;

        // Make sure any web fonts used by text layers have loaded before drawing.
        await document.fonts?.ready;

        const out = document.createElement("canvas");
        out.width = width * EXPORT_SCALE;
        out.height = height * EXPORT_SCALE;

        const ctx = out.getContext("2d");
        if (!ctx) return null;
        ctx.scale(EXPORT_SCALE, EXPORT_SCALE);

        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        for (const id of layerOrderRef.current) {
            const layer = layerMapRef.current.get(id);
            if (!layer) continue;

            if (layer.kind === "draw") {
                ctx.drawImage(layer.canvas, 0, 0, width, height);
            } else if (layer.kind === "text") {
                drawTextLayer(ctx, layer.data, width, height);
            } else {
                await layer.img.decode().catch(() => {}); // a redone image may still be loading
                const w = layer.data.width * width;
                const h = w * layer.data.aspect;
                ctx.drawImage(layer.img, layer.data.x * width - w / 2, layer.data.y * height - h / 2, w, h);
            }
        }

        const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, "image/png"));
        return blob ? URL.createObjectURL(blob) : null;
    };

    useEffect(() => {
        if (exportTrigger === 0) return;
        let cancelled = false;

        exportImage().then((url) => {
            if (cancelled) {
                if (url) URL.revokeObjectURL(url);
                return;
            }
            // Free the previous export's memory before replacing it.
            if (exportUrlRef.current) URL.revokeObjectURL(exportUrlRef.current);
            exportUrlRef.current = url;
            dispatch(setExportedImage(url));
        });

        return () => {
            cancelled = true;
        };
    }, [exportTrigger]);

    // ---------- Redux sync ----------

    const setActive = (id: number | null) => {
        activeLayerIdRef.current = id;
        dispatch(setActiveLayer(id));
    };

    const highlightActive = () => {
        layerMapRef.current.forEach((layer, id) => {
            if (layer.kind === "draw") return;
            const active = id === activeLayerIdRef.current;
            layer.el.style.outline = active ? "1.5px dashed rgba(0, 0, 0, 0.45)" : "none";

            if (layer.kind === "image") {
                const handle = layer.el.querySelector<HTMLElement>("[data-resize-handle]");
                if (handle) handle.style.display = active ? "block" : "none";
            }
        });
    };

    const syncLayers = () => {
        const layers = layerOrderRef.current.flatMap<LayerInfo>((id) => {
            const layer = layerMapRef.current.get(id);
            if (!layer) return [];

            switch (layer.kind) {
                case "draw":
                    return [{ id, kind: "draw", name: `Layer ${id}`, thumbnail: makeThumbnail(layer.canvas) }];
                case "text": {
                    const snippet = layer.data.text.trim().split("\n")[0].slice(0, 24);
                    return [{ id, kind: "text", name: snippet || "Text", thumbnail: "" }];
                }
                case "image":
                    return [{ id, kind: "image", name: "Image", thumbnail: layer.data.src }];
            }
        });
        dispatch(setLayers(layers));
        highlightActive();
    };

    const syncHistoryState = () => {
        dispatch(setHistoryState({
            canUndo: historyIndexRef.current > 0,
            canRedo: historyIndexRef.current < historyRef.current.length,
        }));
    };

    // Keeps the text panel showing the selected text layer's style.
    const syncActiveTextStyle = () => {
        const id = activeLayerIdRef.current;
        const layer = id !== null ? layerMapRef.current.get(id) : undefined;
        if (layer?.kind === "text") dispatch(setTextStyle(pickTextStyle(layer.data)));
    };

    // ---------- layers ----------

    const createDrawLayer = (id: number): DrawLayer | null => {
        const container = layersRef.current;
        if (!container) return null;

        const rect = container.getBoundingClientRect();
        const canvas = document.createElement("canvas");
        canvas.width = rect.width;
        canvas.height = rect.height;
        canvas.dataset.layerId = String(id);
        canvas.style.cssText =
            "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;";

        container.appendChild(canvas);
        const layer: DrawLayer = { kind: "draw", canvas };
        layerMapRef.current.set(id, layer);
        return layer;
    };

    const renderText = (layer: TextLayer) => {
        const { el, data } = layer;
        el.style.left = `${data.x * 100}%`;
        el.style.top = `${data.y * 100}%`;
        el.style.fontFamily = data.fontFamily;
        el.style.fontSize = `${data.fontSize}px`;
        el.style.color = data.color;
        el.style.textAlign = data.align;
        // Don't overwrite the content while it's being typed in (the caret would jump).
        if (document.activeElement !== el) el.innerText = data.text;
    };

    const renderImage = (layer: ImageLayer) => {
        const { el, data } = layer;
        el.style.left = `${data.x * 100}%`;
        el.style.top = `${data.y * 100}%`;
        el.style.width = `${data.width * 100}%`;
    };

    const createTextLayer = (id: number, data: TextData): TextLayer | null => {
        const container = layersRef.current;
        if (!container) return null;

        const el = document.createElement("div");
        el.dataset.layerId = String(id);
        el.dataset.textLayer = "";
        el.style.cssText =
            `position:absolute;transform:translate(-50%,-50%);white-space:pre;` +
            `line-height:${TEXT_LINE_HEIGHT};padding:${TEXT_PAD_Y}px ${TEXT_PAD_X}px;outline-offset:2px;`;
        setEditable(el, false);

        container.appendChild(el);
        const layer: TextLayer = { kind: "text", el, data };
        layerMapRef.current.set(id, layer);
        renderText(layer);
        return layer;
    };

    const createImageLayer = (id: number, data: ImageLayerData): ImageLayer | null => {
        const container = layersRef.current;
        if (!container) return null;

        const el = document.createElement("div");
        el.dataset.layerId = String(id);
        el.dataset.imageLayer = "";
        el.style.cssText =
            "position:absolute;transform:translate(-50%,-50%);cursor:move;outline-offset:2px;" +
            "user-select:none;-webkit-user-select:none;";

        const img = document.createElement("img");
        img.src = data.src;
        img.alt = "";
        img.draggable = false;
        img.style.cssText =
            "display:block;width:100%;height:auto;pointer-events:none;user-select:none;";

        const handle = document.createElement("div");
        handle.dataset.resizeHandle = "";
        handle.style.cssText =
            `position:absolute;right:-${HANDLE_SIZE / 2}px;bottom:-${HANDLE_SIZE / 2}px;` +
            `width:${HANDLE_SIZE}px;height:${HANDLE_SIZE}px;background:#fff;` +
            `border:1.5px solid #111;border-radius:50%;cursor:nwse-resize;display:none;`;

        el.append(img, handle);
        container.appendChild(el);

        const layer: ImageLayer = { kind: "image", el, img, data };
        layerMapRef.current.set(id, layer);
        renderImage(layer);
        return layer;
    };

    const removeLayer = (id: number) => {
        const layer = layerMapRef.current.get(id);
        if (layer) layerNode(layer).remove();
        layerMapRef.current.delete(id);
        layerOrderRef.current = layerOrderRef.current.filter((other) => other !== id);
        if (elementDragRef.current?.id === id) elementDragRef.current = null;
        if (editSessionRef.current?.id === id) editSessionRef.current = null;
        if (activeLayerIdRef.current === id) setActive(null);
    };

    const applyOrder = (order: number[]) => {
        const container = layersRef.current;
        if (!container) return;

        const valid = order.filter((id) => layerMapRef.current.has(id));
        const missing = [...layerMapRef.current.keys()].filter((id) => !valid.includes(id));
        const finalOrder = [...valid, ...missing];

        finalOrder.forEach((id) => container.appendChild(layerNode(layerMapRef.current.get(id)!)));
        layerOrderRef.current = finalOrder;
    };

    const applyLayerState = (id: number, snapshot: LayerSnapshot | null) => {
        if (!snapshot) {
            removeLayer(id);
            return;
        }

        let layer = layerMapRef.current.get(id);
        if (layer && layer.kind !== snapshot.kind) {
            removeLayer(id);
            layer = undefined;
        }

        if (snapshot.kind === "text") {
            if (layer?.kind === "text") {
                layer.data = { ...snapshot.data };
                renderText(layer);
            } else {
                createTextLayer(id, { ...snapshot.data });
            }
            return;
        }

        if (snapshot.kind === "image") {
            if (layer?.kind === "image") {
                layer.data = { ...snapshot.data };
                renderImage(layer);
            } else {
                createImageLayer(id, { ...snapshot.data });
            }
            return;
        }

        const drawLayer = layer?.kind === "draw" ? layer : createDrawLayer(id);
        const ctx = drawLayer?.canvas.getContext("2d");
        if (!drawLayer || !ctx) return;

        const { canvas } = drawLayer;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
            snapshot.image,
            0, 0, snapshot.image.width, snapshot.image.height,
            0, 0, canvas.width, canvas.height
        );
    };

    const deleteActiveLayer = () => {
        if (isDrawingRef.current || editSessionRef.current) return false;
        const id = activeLayerIdRef.current;
        const layer = id !== null ? layerMapRef.current.get(id) : undefined;
        if (id === null || !layer) return false;

        const orderBefore = [...layerOrderRef.current];
        const before = snapshotLayer(layer);
        removeLayer(id);
        pushHistory([{ layerId: id, before, after: null }], orderBefore, [...layerOrderRef.current]);
        return true;
    };

    // ---------- history ----------

    const pushHistory = (
        changes: LayerChange[],
        orderBefore: number[],
        orderAfter: number[],
        mergeKey?: string
    ) => {
        if (changes.length === 0 && sameOrder(orderBefore, orderAfter)) return;

        const now = Date.now();
        const last = historyRef.current[historyIndexRef.current - 1];
        const atTop = historyIndexRef.current === historyRef.current.length;

        // Fold rapid repeats (e.g. dragging the size slider) into one undo step.
        if (mergeKey && last && atTop && last.mergeKey === mergeKey && now - last.time < MERGE_WINDOW_MS) {
            last.changes = last.changes.map((change) => {
                const next = changes.find((c) => c.layerId === change.layerId);
                return next ? { ...change, after: next.after } : change;
            });
            last.orderAfter = orderAfter;
            last.time = now;
            syncHistoryState();
            syncLayers();
            return;
        }

        const history = historyRef.current.slice(0, historyIndexRef.current);
        history.push({ changes, orderBefore, orderAfter, mergeKey, time: now });
        if (history.length > MAX_HISTORY) history.shift();

        historyRef.current = history;
        historyIndexRef.current = history.length;
        syncHistoryState();
        syncLayers();
    };

    const undo = () => {
        if (isDrawingRef.current || historyIndexRef.current === 0) return;
        const entry = historyRef.current[historyIndexRef.current - 1];
        entry.changes.forEach((change) => applyLayerState(change.layerId, change.before));
        applyOrder(entry.orderBefore);
        historyIndexRef.current -= 1;
        syncActiveTextStyle();
        syncHistoryState();
        syncLayers();
    };

    const redo = () => {
        if (isDrawingRef.current || historyIndexRef.current >= historyRef.current.length) return;
        const entry = historyRef.current[historyIndexRef.current];
        entry.changes.forEach((change) => applyLayerState(change.layerId, change.after));
        applyOrder(entry.orderAfter);
        historyIndexRef.current += 1;
        syncActiveTextStyle();
        syncHistoryState();
        syncLayers();
    };

    // ---------- text editing ----------

    const startEditing = (id: number, orderBeforeNew?: number[]) => {
        const layer = layerMapRef.current.get(id);
        if (layer?.kind !== "text" || editSessionRef.current?.id === id) return;
        if (editSessionRef.current) finishEditing();

        editSessionRef.current = {
            id,
            before: orderBeforeNew ? null : snapshotLayer(layer),
            orderBefore: orderBeforeNew ?? [...layerOrderRef.current],
        };

        setEditable(layer.el, true);
        layer.el.focus();
        selectAllText(layer.el);
    };

    const finishEditing = () => {
        const session = editSessionRef.current;
        if (!session) return;
        editSessionRef.current = null;

        const layer = layerMapRef.current.get(session.id);
        if (layer?.kind !== "text") return;

        setEditable(layer.el, false);
        window.getSelection()?.removeAllRanges();

        const text = layer.el.innerText.replace(/\n+$/, "");
        layer.data.text = text;

        // Emptied text removes the layer.
        if (!text.trim()) {
            removeLayer(session.id);
            if (session.before) {
                pushHistory(
                    [{ layerId: session.id, before: session.before, after: null }],
                    session.orderBefore,
                    [...layerOrderRef.current]
                );
            } else {
                syncLayers();
            }
            return;
        }

        renderText(layer);
        if (session.before?.kind === "text" && session.before.data.text === text) return;

        pushHistory(
            [{ layerId: session.id, before: session.before, after: snapshotLayer(layer) }],
            session.orderBefore,
            [...layerOrderRef.current]
        );
    };

    const createTextAt = (x: number, y: number) => {
        if (editSessionRef.current) finishEditing();

        const id = nextLayerIdRef.current++;
        const orderBefore = [...layerOrderRef.current];
        const layer = createTextLayer(id, { ...textStyle, text: DEFAULT_TEXT, x, y });
        if (!layer) return;

        layerOrderRef.current = [...orderBefore, id];
        setActive(id);
        syncLayers();
        startEditing(id, orderBefore);
    };

    // ---------- effects ----------

    useEffect(() => {
        activeLayerIdRef.current = activeLayerId;
        highlightActive();

        const layer = activeLayerId !== null ? layerMapRef.current.get(activeLayerId) : undefined;
        if (!layer) return;

        if (layer.kind === "text") dispatch(setTextStyle(pickTextStyle(layer.data)));

        // Selecting a layer opens the matching tool.
        const tool = layer.kind;
        if (activeTool !== tool) dispatch(setActiveTool(tool));
    }, [activeLayerId]);

    // Panel style changes apply to the selected text layer.
    useEffect(() => {
        const id = activeLayerIdRef.current;
        const layer = id !== null ? layerMapRef.current.get(id) : undefined;
        if (id === null || layer?.kind !== "text" || sameTextStyle(layer.data, textStyle)) return;

        const before = snapshotLayer(layer);
        Object.assign(layer.data, textStyle);
        renderText(layer);

        const order = [...layerOrderRef.current];
        pushHistory(
            [{ layerId: id, before, after: snapshotLayer(layer) }],
            order,
            order,
            `text-style:${id}`
        );
    }, [textStyle]);

    useEffect(() => {
        if (addTextTrigger === 0) return;
        createTextAt(0.5, 0.5);
    }, [addTextTrigger]);

    useEffect(() => {
        const area = areaRef.current;
        const overlay = overlayRef.current;
        if (!area || !overlay) return;

        const resizeCanvas = () => {
            const { width, height } = area.getBoundingClientRect();
            if (width === 0 || height === 0) return;

            // Text layers position themselves in percentages, so only canvases need this.
            layerMapRef.current.forEach((layer) => {
                if (layer.kind !== "draw") return;
                const { canvas } = layer;
                const old = copyCanvas(canvas);
                canvas.width = width;
                canvas.height = height;
                canvas.getContext("2d")?.drawImage(
                    old,
                    0, 0, old.width, old.height,
                    0, 0, canvas.width, canvas.height
                );
            });

            overlay.width = width;
            overlay.height = height;
        };

        resizeCanvas();
        const observer = new ResizeObserver(resizeCanvas);
        observer.observe(area);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (clearTrigger === 0) return;

        const orderBefore = [...layerOrderRef.current];
        const changes: LayerChange[] = orderBefore.flatMap((layerId) => {
            const layer = layerMapRef.current.get(layerId);
            return layer ? [{ layerId, before: snapshotLayer(layer), after: null }] : [];
        });
        changes.forEach((change) => removeLayer(change.layerId));

        const overlay = overlayRef.current;
        overlay?.getContext("2d")?.clearRect(0, 0, overlay.width, overlay.height);

        pushHistory(changes, orderBefore, []);
    }, [clearTrigger]);

    useEffect(() => {
        if (!layerOrderRequest || isDrawingRef.current) return;

        const orderBefore = [...layerOrderRef.current];
        applyOrder(layerOrderRequest.order);
        pushHistory([], orderBefore, [...layerOrderRef.current]);
    }, [layerOrderRequest]);

    useEffect(() => {
        if (undoTrigger === 0) return;
        undo();
    }, [undoTrigger]);

    useEffect(() => {
        if (redoTrigger === 0) return;
        redo();
    }, [redoTrigger]);

    useEffect(() => {
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target;
            if (!(target instanceof Element)) return;
            if (areaRef.current?.contains(target)) return;
            if (target.closest("[data-drawing-tools]")) return;
            setActive(null);
        };

        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, []);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            // Editor hidden (publish step): ignore shortcuts.
            if (!areaRef.current || areaRef.current.getClientRects().length === 0) return;
            const target = event.target;
            if (
                target instanceof HTMLElement &&
                (target.isContentEditable ||
                    target.matches("textarea, select, input[type='text'], input[type='search'], input[type='number']"))
            ) return;

            const mod = event.metaKey || event.ctrlKey;

            if (!mod && (event.key === "Delete" || event.key === "Backspace")) {
                if (deleteActiveLayer()) event.preventDefault();
                return;
            }

            if (!mod) return;
            const key = event.key.toLowerCase();

            if (key === "z" && !event.shiftKey) {
                event.preventDefault();
                dispatch(triggerUndo());
            } else if ((key === "z" && event.shiftKey) || key === "y") {
                event.preventDefault();
                dispatch(triggerRedo());
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [dispatch]);

    useEffect(() => {
        if (!addImagesRequest) return;
        let cancelled = false;

        const loadImage = (src: string) =>
            new Promise<HTMLImageElement | null>((resolve) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => resolve(null);
                img.src = src;
            });

        Promise.all(addImagesRequest.srcs.map(loadImage)).then((images) => {
            if (cancelled) return;
            const overlay = overlayRef.current;
            if (!overlay || !overlay.width || !overlay.height) return;

            const W = overlay.width;
            const H = overlay.height;
            if (editSessionRef.current) finishEditing();

            const orderBefore = [...layerOrderRef.current];
            const changes: LayerChange[] = [];
            let lastId: number | null = null;

            for (const [i, img] of images.entries()) {
                if (!img || !img.naturalWidth) continue;

                const aspect = img.naturalHeight / img.naturalWidth;
                // Fit within 60% of the artboard in both directions.
                const widthPx = Math.min(W * 0.6, (H * 0.6) / aspect);
                const offset = i * 0.03; // fan out multiple uploads slightly

                const id = nextLayerIdRef.current++;
                const layer = createImageLayer(id, {
                    src: img.src,
                    x: clamp01(0.5 + offset),
                    y: clamp01(0.5 + offset),
                    width: widthPx / W,
                    aspect,
                });
                if (!layer) continue;

                layerOrderRef.current = [...layerOrderRef.current, id];
                changes.push({ layerId: id, before: null, after: snapshotLayer(layer) });
                lastId = id;
            }

            if (lastId !== null) setActive(lastId);
            pushHistory(changes, orderBefore, [...layerOrderRef.current]);
        });

        return () => {
            cancelled = true;
        };
    }, [addImagesRequest]);

    // ---------- brush helpers ----------

    const getPosition = (event: React.PointerEvent<HTMLCanvasElement>): Point | null => {
        const overlay = overlayRef.current;
        if (!overlay) return null;
        const rect = overlay.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const applyBase = (ctx: CanvasRenderingContext2D) => {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
    };

    const segment = (ctx: CanvasRenderingContext2D, from: Point, to: Point) => {
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x === from.x && to.y === from.y ? to.x + 0.01 : to.x, to.y);
        ctx.stroke();
    };

    const strokePath = (ctx: CanvasRenderingContext2D, points: Point[]) => {
        if (points.length === 1) return segment(ctx, points[0], points[0]);
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
        ctx.stroke();
    };

    const sprayAt = (ctx: CanvasRenderingContext2D, p: Point) => {
        const density = Math.ceil(brushSize * 1.5);
        const dot = Math.max(1, brushSize / 15);
        for (let i = 0; i < density; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = brushSize * Math.sqrt(Math.random());
            ctx.fillRect(p.x + Math.cos(angle) * r, p.y + Math.sin(angle) * r, dot, dot);
        }
    };

    const sprayAlong = (ctx: CanvasRenderingContext2D, from: Point, to: Point) => {
        const dist = Math.hypot(to.x - from.x, to.y - from.y);
        const steps = Math.max(1, Math.ceil(dist / (brushSize / 2)));
        for (let s = 1; s <= steps; s++) {
            const t = s / steps;
            sprayAt(ctx, { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t });
        }
    };

    const crayonSegment = (ctx: CanvasRenderingContext2D, from: Point, to: Point) => {
        const strands = Math.max(3, Math.round(brushSize / 3));
        for (let i = 0; i < strands; i++) {
            const ox = (Math.random() - 0.5) * brushSize;
            const oy = (Math.random() - 0.5) * brushSize;
            ctx.globalAlpha = 0.4 + Math.random() * 0.5;
            ctx.lineWidth = Math.max(1, (brushSize / strands) * (1 + Math.random()));
            segment(ctx, { x: from.x + ox, y: from.y + oy }, { x: to.x + ox, y: to.y + oy });
        }
    };

    const render = (from: Point, to: Point) => {
        const overlay = overlayRef.current;
        const preview = overlay?.getContext("2d");
        if (!overlay || !preview) return;

        if (brushStyle === "eraser") {
            layerMapRef.current.forEach((layer) => {
                if (layer.kind !== "draw") return;
                const ctx = layer.canvas.getContext("2d");
                if (!ctx) return;
                ctx.save();
                ctx.globalCompositeOperation = "destination-out";
                applyBase(ctx);
                segment(ctx, from, to);
                ctx.restore();
            });
            return;
        }

        preview.save();
        applyBase(preview);

        switch (brushStyle) {
            case "pencil":
                preview.clearRect(0, 0, overlay.width, overlay.height);
                strokePath(preview, pointsRef.current);
                break;

            case "glow":
                preview.clearRect(0, 0, overlay.width, overlay.height);
                preview.shadowBlur = brushSize * 2;
                preview.shadowColor = color;
                strokePath(preview, pointsRef.current);
                preview.shadowBlur = 0;
                preview.lineWidth = Math.max(1, brushSize * 0.35);
                preview.strokeStyle = "rgba(255, 255, 255, 0.85)";
                strokePath(preview, pointsRef.current);
                break;

            case "spray":
                sprayAlong(preview, from, to);
                break;

            case "crayon":
                crayonSegment(preview, from, to);
                break;
        }

        preview.restore();
    };

    // ---------- brush cursor ----------

    const hideCursor = () => {
        if (cursorRef.current) cursorRef.current.style.visibility = "hidden";
    };

    const moveCursor = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const cursor = cursorRef.current;
        const position = getPosition(event);
        if (!cursor || !position) return;

        if (!isDrawTool || event.pointerType === "touch") {
            hideCursor();
            return;
        }

        cursor.style.visibility = "visible";
        cursor.style.transform = `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`;
    };

    // ---------- drawing pointer handlers ----------

    const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawTool) return;
        const overlay = overlayRef.current;
        const position = getPosition(event);
        if (!overlay || !position) return;

        const before = new Map<number, LayerSnapshot | null>();

        if (brushStyle === "eraser") {
            layerMapRef.current.forEach((layer, id) => {
                if (layer.kind === "draw") before.set(id, snapshotLayer(layer));
            });
        } else {
            const activeId = activeLayerIdRef.current;
            const active = activeId !== null ? layerMapRef.current.get(activeId) : undefined;

            if (activeId !== null && active?.kind === "draw") {
                before.set(activeId, snapshotLayer(active));
            } else {
                // No active drawing layer (none, or a text layer): start a new one.
                const id = nextLayerIdRef.current++;
                setActive(id);
                before.set(id, null);
            }
        }

        pendingBeforeRef.current = before;
        pendingOrderBeforeRef.current = [...layerOrderRef.current];
        overlay.setPointerCapture(event.pointerId);
        isDrawingRef.current = true;
        pointsRef.current = [position];
        render(position, position);
    };

    const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current) return;
        const position = getPosition(event);
        if (!position) return;

        const points = pointsRef.current;
        const last = points[points.length - 1];
        points.push(position);
        render(last, position);
    };

    const stopDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const overlay = overlayRef.current;
        if (!overlay || !isDrawingRef.current) return;

        if (overlay.hasPointerCapture(event.pointerId)) {
            overlay.releasePointerCapture(event.pointerId);
        }
        isDrawingRef.current = false;

        const changes: LayerChange[] = [];

        if (brushStyle === "eraser") {
            pendingBeforeRef.current.forEach((before, layerId) => {
                const layer = layerMapRef.current.get(layerId);
                if (layer) changes.push({ layerId, before, after: snapshotLayer(layer) });
            });
        } else {
            const layerId = activeLayerIdRef.current;
            const existing = layerId !== null ? layerMapRef.current.get(layerId) : undefined;
            let drawLayer = existing?.kind === "draw" ? existing : undefined;

            // First stroke of a new layer: create it on top.
            if (layerId !== null && !existing) {
                drawLayer = createDrawLayer(layerId) ?? undefined;
                if (drawLayer) layerOrderRef.current = [...layerOrderRef.current, layerId];
            }

            const ctx = drawLayer?.canvas.getContext("2d");
            if (layerId !== null && drawLayer && ctx) {
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.drawImage(overlay, 0, 0);
                ctx.restore();

                changes.push({
                    layerId,
                    before: pendingBeforeRef.current.get(layerId) ?? null,
                    after: snapshotLayer(drawLayer),
                });
            }

            overlay.getContext("2d")?.clearRect(0, 0, overlay.width, overlay.height);
        }

        pointsRef.current = [];
        pendingBeforeRef.current = new Map();
        pushHistory(changes, pendingOrderBeforeRef.current, [...layerOrderRef.current]);
    };

    const handleLayersPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (isDrawTool || event.button !== 0) return;
        const target = event.target as HTMLElement;
        const el = target.closest<HTMLElement>("[data-text-layer], [data-image-layer]");

        if (el) {
            const id = Number(el.dataset.layerId);
            const layer = layerMapRef.current.get(id);
            if (!layer || layer.kind === "draw") return;
            if (editSessionRef.current?.id === id) return; // editing text: let the caret move

            setActive(id);
            el.setPointerCapture(event.pointerId);
            elementDragRef.current = {
                id,
                pointerId: event.pointerId,
                mode: layer.kind === "image" && target.closest("[data-resize-handle]") ? "resize" : "move",
                startX: event.clientX,
                startY: event.clientY,
                origX: layer.data.x,
                origY: layer.data.y,
                origWidth: layer.kind === "image" ? layer.data.width : 0,
                before: snapshotLayer(layer),
                moved: false,
            };
            return;
        }

        // Empty artboard: only the Text tool creates something here.
        if (!isTextTool || event.target !== event.currentTarget || editSessionRef.current) return;

        const rect = event.currentTarget.getBoundingClientRect();
        pendingCreateRef.current = {
            x: clamp01((event.clientX - rect.left) / rect.width),
            y: clamp01((event.clientY - rect.top) / rect.height),
        };
    };

    const handleLayersPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const drag = elementDragRef.current;
        if (!drag || event.pointerId !== drag.pointerId) return;

        const layer = layerMapRef.current.get(drag.id);
        const container = layersRef.current;
        if (!layer || layer.kind === "draw" || !container) return;

        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;
        if (!drag.moved && Math.hypot(dx, dy) < 3) return; // small wobble = click
        drag.moved = true;

        const rect = container.getBoundingClientRect();

        if (drag.mode === "resize" && layer.kind === "image") {
            const { aspect } = layer.data;
            const origWidthPx = drag.origWidth * rect.width;
            const origHeightPx = origWidthPx * aspect;

            // Keep the top-left corner fixed while the bottom-right follows the pointer.
            const left = drag.origX * rect.width - origWidthPx / 2;
            const top = drag.origY * rect.height - origHeightPx / 2;

            // Follow whichever direction moved further, keeping the aspect ratio.
            const grow = Math.max(dx, dy / aspect);
            const widthPx = Math.max(MIN_IMAGE_PX, origWidthPx + grow);

            layer.data.width = widthPx / rect.width;
            layer.data.x = (left + widthPx / 2) / rect.width;
            layer.data.y = (top + (widthPx * aspect) / 2) / rect.height;
            renderImage(layer);
            return;
        }

        layer.data.x = clamp01(drag.origX + dx / rect.width);
        layer.data.y = clamp01(drag.origY + dy / rect.height);
        if (layer.kind === "text") renderText(layer);
        else renderImage(layer);
    };

    const handleLayersPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
        const drag = elementDragRef.current;

        if (drag && event.pointerId === drag.pointerId) {
            elementDragRef.current = null;
            const layer = layerMapRef.current.get(drag.id);
            if (layer && layer.kind !== "draw") {
                if (layer.el.hasPointerCapture(event.pointerId)) {
                    layer.el.releasePointerCapture(event.pointerId);
                }
                if (drag.moved) {
                    const order = [...layerOrderRef.current];
                    pushHistory(
                        [{ layerId: drag.id, before: drag.before, after: snapshotLayer(layer) }],
                        order,
                        order
                    );
                }
            }
            return;
        }

        const pending = pendingCreateRef.current;
        pendingCreateRef.current = null;
        if (pending) createTextAt(pending.x, pending.y);
    };

    const handleLayersPointerCancel = () => {
        const drag = elementDragRef.current;
        elementDragRef.current = null;
        pendingCreateRef.current = null;
        if (drag?.moved) applyLayerState(drag.id, drag.before); // put it back
    };

    const handleLayersDoubleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!isTextTool) return;
        const textEl = (event.target as HTMLElement).closest<HTMLDivElement>("[data-text-layer]");
        if (textEl) startEditing(Number(textEl.dataset.layerId));
    };

    const handleLayersBlur = (event: React.FocusEvent<HTMLDivElement>) => {
        const session = editSessionRef.current;
        if (!session) return;
        const layer = layerMapRef.current.get(session.id);
        if (layer?.kind === "text" && event.target === layer.el) finishEditing();
    };

    const handleLayersKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Escape" && editSessionRef.current) {
            (event.target as HTMLElement).blur();
        }
    };

    return (
        <div className="w-125 h-187.5 flex flex-col gap-3.5">
            <div
                ref={areaRef}
                className="drawing-area relative overflow-hidden"
                style={{ backgroundColor }}
            >
                <div
                    ref={layersRef}
                    className={`absolute inset-0 ${isTextTool ? "cursor-text" : ""} ${isDrawTool ? "" : "touch-none"}`}
                    onPointerDown={handleLayersPointerDown}
                    onPointerMove={handleLayersPointerMove}
                    onPointerUp={handleLayersPointerUp}
                    onPointerCancel={handleLayersPointerCancel}
                    onDoubleClick={handleLayersDoubleClick}
                    onBlur={handleLayersBlur}
                    onKeyDown={handleLayersKeyDown}
                />
                <canvas
                    ref={overlayRef}
                    className={`absolute inset-0 w-full h-full touch-none ${
                        isDrawTool ? "cursor-none" : "pointer-events-none"
                    }`}
                    style={{ opacity }}
                    onPointerDown={(e) => {
                        moveCursor(e);
                        startDrawing(e);
                    }}
                    onPointerMove={(e) => {
                        moveCursor(e);
                        draw(e);
                    }}
                    onPointerUp={stopDrawing}
                    onPointerCancel={stopDrawing}
                    onPointerLeave={(e) => {
                        hideCursor();
                        stopDrawing(e);
                    }}
                />
                <div
                    ref={cursorRef}
                    aria-hidden
                    className="invisible pointer-events-none absolute left-0 top-0 rounded-full border border-white"
                    style={{
                        width: cursorDiameter,
                        height: cursorDiameter,
                        boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.6)",
                    }}
                />
            </div>
        </div>
    );
}