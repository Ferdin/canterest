import { useEffect, useRef, useState } from "react";
import { GripVertical, Lock } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
    requestLayerOrder,
    setActiveLayer,
    setBackgroundColor,
} from "../../../features/canvas/canvasSlice";

type DragState = {
    id: number;
    from: number; // index where the drag started (top-first list)
    to: number;   // index it would drop at right now
    dy: number;   // how far the row has moved from its original spot
    step: number; // one row's height plus the gap, for shifting neighbours
};

type RowRect = { top: number; height: number };

const moveItem = <T,>(list: T[], from: number, to: number) => {
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
};

export default function LayersPanel() {
    const dispatch = useAppDispatch();
    const layers = useAppSelector((state) => state.canvas.layers);
    const activeLayerId = useAppSelector((state) => state.canvas.activeLayerId);
    const backgroundColor = useAppSelector((state) => state.canvas.backgroundColor);

    // The panel shows the top layer first; Redux stores bottom → top.
    const topFirst = [...layers].reverse();
    const ids = topFirst.map((layer) => layer.id);

    const [drag, setDrag] = useState<DragState | null>(null);

    const rowRefs = useRef(new Map<number, HTMLLIElement>());
    const gripRefs = useRef(new Map<number, HTMLButtonElement>());
    const dragStartRef = useRef<{ startY: number; rects: RowRect[] } | null>(null);
    const focusAfterMoveRef = useRef<number | null>(null);

    const commitMove = (from: number, to: number) => {
        if (from === to) return;
        dispatch(requestLayerOrder(moveItem(ids, from, to).reverse()));
    };

    // ---------- pointer dragging ----------

    const handlePointerDown = (
        event: React.PointerEvent<HTMLButtonElement>,
        id: number,
        index: number
    ) => {
        if (event.button !== 0) return;
        event.preventDefault(); // stops text selection while dragging

        // Measure every row once; the math below works from these positions.
        const rects: RowRect[] = ids.map((layerId) => {
            const rect = rowRefs.current.get(layerId)?.getBoundingClientRect();
            return { top: rect?.top ?? 0, height: rect?.height ?? 0 };
        });
        const gap = rects.length > 1 ? rects[1].top - (rects[0].top + rects[0].height) : 0;

        dragStartRef.current = { startY: event.clientY, rects };
        event.currentTarget.setPointerCapture(event.pointerId);
        setDrag({ id, from: index, to: index, dy: 0, step: rects[index].height + gap });
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
        const start = dragStartRef.current;
        if (!drag || !start) return;

        const { rects } = start;
        const self = rects[drag.from];
        const first = rects[0];
        const last = rects[rects.length - 1];

        // Keep the row inside the list: vertical only, no further than the ends.
        const minDy = first.top - self.top;
        const maxDy = last.top + last.height - (self.top + self.height);
        const dy = Math.min(maxDy, Math.max(minDy, event.clientY - start.startY));

        // Drop index = where the dragged row's center sits among the others' centers.
        // Swap once the dragged row's leading edge crosses a neighbour's center.
        const top = self.top + dy;
        const bottom = top + self.height;
        const centers = rects.map((rect) => rect.top + rect.height / 2);

        let to = drag.from;
        for (let i = 0; i < drag.from; i++) {
            if (top < centers[i]) {
                to = i;
                break;
            }
        }
        for (let i = rects.length - 1; i > drag.from; i--) {
            if (bottom > centers[i]) {
                to = i;
                break;
            }
        }

        setDrag({ ...drag, to, dy });
    };

    const endDrag = (event: React.PointerEvent<HTMLButtonElement>, commit: boolean) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        if (!drag) return;

        if (commit) commitMove(drag.from, drag.to);
        dragStartRef.current = null;
        setDrag(null);
    };

    // Escape cancels a drag in progress.
    useEffect(() => {
        if (!drag) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== "Escape") return;
            dragStartRef.current = null;
            setDrag(null);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [drag]);

    // ---------- keyboard reordering ----------

    const handleGripKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
        if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
        event.preventDefault();

        const to = event.key === "ArrowUp" ? index - 1 : index + 1;
        if (to < 0 || to >= ids.length) return;

        focusAfterMoveRef.current = ids[index];
        commitMove(index, to);
    };

    // Moving DOM nodes can drop focus, so put it back on the moved grip.
    useEffect(() => {
        const id = focusAfterMoveRef.current;
        if (id === null) return;
        focusAfterMoveRef.current = null;
        gripRefs.current.get(id)?.focus();
    }, [layers]);

    // ---------- rendering ----------

    const getRowStyle = (id: number, index: number): React.CSSProperties => {
        if (!drag) return {};

        if (id === drag.id) {
            return { transform: `translateY(${drag.dy}px)` };
        }

        let offset = 0;
        if (drag.to > drag.from && index > drag.from && index <= drag.to) offset = -drag.step;
        if (drag.to < drag.from && index >= drag.to && index < drag.from) offset = drag.step;

        // Transitions only run mid-drag; on drop the list re-renders in its
        // new order with no transform, so nothing animates back.
        return { transform: `translateY(${offset}px)`, transition: "transform 150ms ease" };
    };

    return (
        <div
            data-drawing-tools
            className={`w-58 h-[calc(100vh-200px)] rounded-xl mt-1 overflow-y-auto select-none ${
                drag ? "cursor-grabbing" : ""
            }`}
        >
            <div className="flex flex-col gap-2 p-2">
                {layers.length === 0 ? (
                    <p className="px-2 py-4 text-sm text-gray-500">
                        Start drawing to create a layer.
                    </p>
                ) : (
                    <ul className="flex flex-col gap-2">
                        {topFirst.map((layer, index) => {
                            const isActive = layer.id === activeLayerId;
                            const isDragging = drag?.id === layer.id;

                            return (
                                <li
                                    key={layer.id}
                                    ref={(el) => {
                                        if (el) rowRefs.current.set(layer.id, el);
                                        else rowRefs.current.delete(layer.id);
                                    }}
                                    style={getRowStyle(layer.id, index)}
                                    className={`relative rounded-lg ${
                                        isDragging ? "z-10 shadow-lg" : ""
                                    }`}
                                >
                                    <div
                                        className={`flex items-center gap-2 rounded-lg p-2 ${
                                            isActive ? "bg-gray-200" : "bg-white hover:bg-gray-100"
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            ref={(el) => {
                                                if (el) gripRefs.current.set(layer.id, el);
                                                else gripRefs.current.delete(layer.id);
                                            }}
                                            aria-label={`Reorder ${layer.name}. Use the up and down arrow keys to move it.`}
                                            className={`touch-none text-gray-400 hover:text-gray-700 ${
                                                isDragging ? "cursor-grabbing" : "cursor-grab"
                                            }`}
                                            onPointerDown={(e) => handlePointerDown(e, layer.id, index)}
                                            onPointerMove={handlePointerMove}
                                            onPointerUp={(e) => endDrag(e, true)}
                                            onPointerCancel={(e) => endDrag(e, false)}
                                            onKeyDown={(e) => handleGripKeyDown(e, index)}
                                        >
                                            <GripVertical size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            aria-pressed={isActive}
                                            onClick={() => dispatch(setActiveLayer(layer.id))}
                                            className="flex flex-1 items-center gap-3 text-left"
                                        >
                                            {layer.thumbnail && (
                                                <img
                                                    src={layer.thumbnail}
                                                    alt=""
                                                    draggable={false}
                                                    className="h-16 w-12 rounded-md border border-gray-200 object-contain"
                                                    style={{ backgroundColor }}
                                                />
                                            )}
                                            <span className="text-sm font-medium">{layer.name}</span>
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {/* Locked base layer: always last, never draggable */}
                <div className="flex items-center gap-2 rounded-lg bg-white p-2">
                    <Lock size={18} className="text-gray-400" aria-hidden />
                    <label className="flex flex-1 cursor-pointer items-center gap-3">
                        <span
                            className="relative h-16 w-12 overflow-hidden rounded-md border border-gray-200"
                            style={{ backgroundColor }}
                        >
                            <input
                                type="color"
                                value={backgroundColor}
                                aria-label="Artboard color"
                                onChange={(e) => dispatch(setBackgroundColor(e.target.value))}
                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                            />
                        </span>
                        <span className="text-sm font-medium">Background</span>
                    </label>
                </div>
            </div>
        </div>
    );
}