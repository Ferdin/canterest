import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { setHistoryState, triggerUndo, triggerRedo, setLayers, setActiveLayer, type LayerInfo } from "../../../features/canvas/canvasSlice";
import "./index.css";

type Point = { x: number; y: number };
type LayerChange = {
    layerId: number;
    before: HTMLCanvasElement | null; // null = layer didn't exist yet
    after: HTMLCanvasElement | null;  // null = layer was removed
};
type HistoryEntry = LayerChange[];

const MAX_HISTORY = 30;
const THUMB_WIDTH = 96;

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

export default function Canvas() {
    const dispatch = useAppDispatch();

    const areaRef = useRef<HTMLDivElement>(null);
    const layersRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null);

    const layerMapRef = useRef(new Map<number, HTMLCanvasElement>());
    const activeLayerIdRef = useRef<number | null>(null);
    const nextLayerIdRef = useRef(1);

    const isDrawingRef = useRef(false);
    const pointsRef = useRef<Point[]>([]);
    const pendingBeforeRef = useRef(new Map<number, HTMLCanvasElement | null>());

    const historyRef = useRef<HistoryEntry[]>([]);
    const historyIndexRef = useRef(0); // number of entries currently applied

    const color = useAppSelector((state) => state.canvas.color);
    const brushSize = useAppSelector((state) => state.canvas.brushSize);
    const brushStyle = useAppSelector((state) => state.canvas.brushStyle);
    const opacity = useAppSelector((state) => state.canvas.opacity);
    const clearTrigger = useAppSelector((state) => state.canvas.clearTrigger);
    const undoTrigger = useAppSelector((state) => state.canvas.undoTrigger);
    const redoTrigger = useAppSelector((state) => state.canvas.redoTrigger);

    const activeLayerId = useAppSelector((state) => state.canvas.activeLayerId);

    useEffect(() => {
        activeLayerIdRef.current = activeLayerId;
    }, [activeLayerId]);

    // Updates the ref immediately (a stroke may be starting) and tells Redux.
    const setActive = (id: number | null) => {
        activeLayerIdRef.current = id;
        dispatch(setActiveLayer(id));
    }

    const syncLayers = () => {
        const layers: LayerInfo[] = [...layerMapRef.current.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([id, canvas], index) => ({
                id,
                name: `Layer ${index + 1}`,
                thumbnail: makeThumbnail(canvas),
            }));
        dispatch(setLayers(layers));
    };

    // ---------- layers ----------

    const createLayer = (id: number) => {
        const container = layersRef.current;
        if (!container) return null;

        const rect = container.getBoundingClientRect();
        const layer = document.createElement("canvas");
        layer.width = rect.width;
        layer.height = rect.height;
        layer.dataset.layerId = String(id);
        layer.style.cssText =
            "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;";

        // Keep DOM order matching id order so newer layers sit on top,
        // including when redo recreates an older layer.
        const nextSibling = [...layerMapRef.current.entries()]
            .filter(([otherId]) => otherId > id)
            .sort((a, b) => a[0] - b[0])[0]?.[1];

        container.insertBefore(layer, nextSibling ?? null);
        layerMapRef.current.set(id, layer);
        return layer;
    };

    const removeLayer = (id: number) => {
        layerMapRef.current.get(id)?.remove();
        layerMapRef.current.delete(id);
        if (activeLayerIdRef.current === id) setActive(null);
    };

    const applyLayerState = (id: number, snapshot: HTMLCanvasElement | null) => {
        if (!snapshot) {
            removeLayer(id);
            return;
        }

        const layer = layerMapRef.current.get(id) ?? createLayer(id);
        const ctx = layer?.getContext("2d");
        if (!layer || !ctx) return;

        ctx.clearRect(0, 0, layer.width, layer.height);
        ctx.drawImage(
            snapshot,
            0, 0, snapshot.width, snapshot.height,
            0, 0, layer.width, layer.height
        );
    };

    // ---------- history ----------

    const syncHistoryState = () => {
        dispatch(setHistoryState({
            canUndo: historyIndexRef.current > 0,
            canRedo: historyIndexRef.current < historyRef.current.length,
        }));
    };

    const pushHistory = (entry: HistoryEntry) => {
        if (entry.length === 0) return;

        const history = historyRef.current.slice(0, historyIndexRef.current);
        history.push(entry);
        if (history.length > MAX_HISTORY) history.shift();

        historyRef.current = history;
        historyIndexRef.current = history.length;
        syncHistoryState();
        syncLayers();
    };

    const undo = () => {
        if (isDrawingRef.current || historyIndexRef.current === 0) return;
        const entry = historyRef.current[historyIndexRef.current - 1];
        entry.forEach((change) => applyLayerState(change.layerId, change.before));
        historyIndexRef.current -= 1;
        syncHistoryState();
        syncLayers();
    };

    const redo = () => {
        if (isDrawingRef.current || historyIndexRef.current >= historyRef.current.length) return;
        const entry = historyRef.current[historyIndexRef.current];
        entry.forEach((change) => applyLayerState(change.layerId, change.after));
        historyIndexRef.current += 1;
        syncHistoryState();
        syncLayers();
    };

    // ---------- effects ----------

    useEffect(() => {
        const area = areaRef.current;
        const overlay = overlayRef.current;
        if (!area || !overlay) return;

        const resizeCanvas = () => {
            const { width, height } = area.getBoundingClientRect();

            // Preserve each layer's drawing when resizing.
            layerMapRef.current.forEach((layer) => {
                const old = copyCanvas(layer);
                layer.width = width;
                layer.height = height;
                layer.getContext("2d")?.drawImage(
                    old,
                    0, 0, old.width, old.height,
                    0, 0, layer.width, layer.height
                );
            });

            overlay.width = width;
            overlay.height = height;
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        return () => window.removeEventListener("resize", resizeCanvas);
    }, []);

    useEffect(() => {
        if (clearTrigger === 0) return;

        const changes: HistoryEntry = [...layerMapRef.current].map(([layerId, layer]) => ({
            layerId,
            before: copyCanvas(layer),
            after: null,
        }));
        changes.forEach((change) => removeLayer(change.layerId));

        const overlay = overlayRef.current;
        overlay?.getContext("2d")?.clearRect(0, 0, overlay.width, overlay.height);

        pushHistory(changes);
    }, [clearTrigger]);

    useEffect(() => {
        if (undoTrigger === 0) return;
        undo();
    }, [undoTrigger]);

    useEffect(() => {
        if (redoTrigger === 0) return;
        redo();
    }, [redoTrigger]);

    // Clicking outside the drawing area (and outside the toolbar) ends the current layer.
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
            const target = event.target;
            if (
                target instanceof HTMLElement &&
                target.matches("textarea, [contenteditable='true'], input[type='text'], input[type='search'], input[type='number']")
            ) return;

            if (!(event.metaKey || event.ctrlKey)) return;
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
            // Erase through every layer under the pointer.
            layerMapRef.current.forEach((layer) => {
                const ctx = layer.getContext("2d");
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

    // ---------- pointer handlers ----------

    const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const overlay = overlayRef.current;
        const position = getPosition(event);
        if (!overlay || !position) return;

        const before = new Map<number, HTMLCanvasElement | null>();

        if (brushStyle === "eraser") {
            layerMapRef.current.forEach((layer, id) => before.set(id, copyCanvas(layer)));
        } else {
            const activeId = activeLayerIdRef.current;
            const active = activeId !== null ? layerMapRef.current.get(activeId) : undefined;

            if (activeId !== null && active) {
                before.set(activeId, copyCanvas(active));
            } else {
                // No active layer: this stroke starts a new one.
                const id = nextLayerIdRef.current++;
                setActive(id);
                before.set(id, null);
            }
        }

        pendingBeforeRef.current = before;
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

        const changes: HistoryEntry = [];

        if (brushStyle === "eraser") {
            pendingBeforeRef.current.forEach((before, layerId) => {
                const layer = layerMapRef.current.get(layerId);
                if (layer) changes.push({ layerId, before, after: copyCanvas(layer) });
            });
        } else {
            const layerId = activeLayerIdRef.current;
            const layer =
                layerId !== null ? layerMapRef.current.get(layerId) ?? createLayer(layerId) : null;
            const ctx = layer?.getContext("2d");

            if (layerId !== null && layer && ctx) {
                // Commit the finished stroke into the layer at the chosen opacity.
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.drawImage(overlay, 0, 0);
                ctx.restore();

                changes.push({
                    layerId,
                    before: pendingBeforeRef.current.get(layerId) ?? null,
                    after: copyCanvas(layer),
                });
            }

            overlay.getContext("2d")?.clearRect(0, 0, overlay.width, overlay.height);
        }

        pointsRef.current = [];
        pendingBeforeRef.current = new Map();
        pushHistory(changes);
    };

    return (
        <div className="w-125 h-187.5 flex flex-col gap-3.5">
            <div ref={areaRef} className="drawing-area relative">
                <div ref={layersRef} className="absolute inset-0" />
                <canvas
                    ref={overlayRef}
                    className="absolute inset-0 w-full h-full touch-none"
                    style={{ opacity }}
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={stopDrawing}
                    onPointerCancel={stopDrawing}
                    onPointerLeave={stopDrawing}
                />
            </div>
        </div>
    );
}