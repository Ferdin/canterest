import { useEffect, useRef } from "react";
import { useAppSelector } from "../../../app/hooks";
import "./index.css";

type Point = { x: number; y: number };

export default function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);
    const pointsRef = useRef<Point[]>([]);

    const color = useAppSelector((state) => state.canvas.color);
    const brushSize = useAppSelector((state) => state.canvas.brushSize);
    const brushStyle = useAppSelector((state) => state.canvas.brushStyle);
    const opacity = useAppSelector((state) => state.canvas.opacity);
    const clearTrigger = useAppSelector((state) => state.canvas.clearTrigger);

    useEffect(() => {
        const canvas = canvasRef.current;
        const overlay = overlayRef.current;
        if (!canvas || !overlay) return;

        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();

            // Preserve the existing drawing when resizing.
            const oldCanvas = document.createElement("canvas");
            oldCanvas.width = canvas.width;
            oldCanvas.height = canvas.height;

            const oldContext = oldCanvas.getContext("2d");
            const context = canvas.getContext("2d");
            if (!oldContext || !context) return;

            oldContext.drawImage(canvas, 0, 0);

            canvas.width = rect.width;
            canvas.height = rect.height;

            context.drawImage(
                oldCanvas,
                0, 0, oldCanvas.width, oldCanvas.height,
                0, 0, canvas.width, canvas.height
            );

            // Keep the overlay exactly on top of the main canvas.
            overlay.width = rect.width;
            overlay.height = rect.height;
            overlay.style.width = `${rect.width}px`;
            overlay.style.height = `${rect.height}px`;
            overlay.style.left = `${canvas.offsetLeft}px`;
            overlay.style.top = `${canvas.offsetTop}px`;
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        return () => window.removeEventListener("resize", resizeCanvas);
    }, []);

    useEffect(() => {
        if (clearTrigger === 0) return;
        const ctxs = getContexts();
        if (!ctxs) return;

        ctxs.main.clearRect(0, 0, ctxs.canvas.width, ctxs.canvas.height);
        ctxs.layer.clearRect(0, 0, ctxs.overlay.width, ctxs.overlay.height);
    }, [clearTrigger]);

    // ---------- helpers ----------

    const getContexts = () => {
        const canvas = canvasRef.current;
        const overlay = overlayRef.current;
        const main = canvas?.getContext("2d");
        const layer = overlay?.getContext("2d");
        if (!canvas || !overlay || !main || !layer) return null;
        return { canvas, overlay, main, layer };
    };

    const getPosition = (event: React.PointerEvent<HTMLCanvasElement>): Point | null => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const applyBase = (ctx: CanvasRenderingContext2D) => {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
    };

    // Draws a line segment; nudges zero-length segments so a single click leaves a dot.
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
            const r = brushSize * Math.sqrt(Math.random()); // even spread across the circle
            ctx.fillRect(p.x + Math.cos(angle) * r, p.y + Math.sin(angle) * r, dot, dot);
        }
    };

    // Fills the gap between pointer events so fast strokes don't leave gaps.
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
        const ctxs = getContexts();
        if (!ctxs) return;
        const { main, layer, overlay } = ctxs;

        if (brushStyle === "eraser") {
            // Erases straight from the main canvas.
            main.save();
            main.globalCompositeOperation = "destination-out";
            applyBase(main);
            segment(main, from, to);
            main.restore();
            return;
        }

        layer.save();
        applyBase(layer);

        switch (brushStyle) {
            case "pencil":
                layer.clearRect(0, 0, overlay.width, overlay.height);
                strokePath(layer, pointsRef.current);
                break;

            case "glow":
                layer.clearRect(0, 0, overlay.width, overlay.height);
                layer.shadowBlur = brushSize * 2;
                layer.shadowColor = color;
                strokePath(layer, pointsRef.current);
                // Bright core for a neon look.
                layer.shadowBlur = 0;
                layer.lineWidth = Math.max(1, brushSize * 0.35);
                layer.strokeStyle = "rgba(255, 255, 255, 0.85)";
                strokePath(layer, pointsRef.current);
                break;

            case "spray":
                sprayAlong(layer, from, to);
                break;

            case "crayon":
                crayonSegment(layer, from, to);
                break;
        }

        layer.restore();
    };

    // ---------- pointer handlers ----------

    const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        const position = getPosition(event);
        if (!canvas || !position) return;

        canvas.setPointerCapture(event.pointerId);
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
        const canvas = canvasRef.current;
        if (!canvas || !isDrawingRef.current) return;

        if (canvas.hasPointerCapture(event.pointerId)) {
            canvas.releasePointerCapture(event.pointerId);
        }
        isDrawingRef.current = false;

        // Commit the finished stroke onto the main canvas at the chosen opacity.
        const ctxs = getContexts();
        if (ctxs && brushStyle !== "eraser") {
            ctxs.main.save();
            ctxs.main.globalAlpha = opacity;
            ctxs.main.drawImage(ctxs.overlay, 0, 0);
            ctxs.main.restore();
            ctxs.layer.clearRect(0, 0, ctxs.overlay.width, ctxs.overlay.height);
        }
        pointsRef.current = [];
    };

    return (
        <div className="w-125 h-187.5 flex flex-col gap-3.5">
            <div className="drawing-area relative">
                <canvas
                    ref={canvasRef}
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={stopDrawing}
                    onPointerCancel={stopDrawing}
                    onPointerLeave={stopDrawing}
                />
                <canvas
                    ref={overlayRef}
                    className="absolute pointer-events-none"
                    style={{ opacity }}
                />
            </div>
        </div>
    );
}