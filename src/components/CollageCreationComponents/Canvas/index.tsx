import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../../app/hooks";
import "./index.css";

export default function Canvas(){
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);

    const color = useAppSelector((state) => state.canvas.color);
    const brushSize = useAppSelector((state) => state.canvas.brushSize);
    const clearTrigger = useAppSelector((state) => state.canvas.clearTrigger);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

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
                0,
                0,
                oldCanvas.width,
                oldCanvas.height,
                0,
                0,
                canvas.width,
                canvas.height
            );
        };

        resizeCanvas();

        window.addEventListener("resize", resizeCanvas);

        return () => {
            window.removeEventListener("resize", resizeCanvas);
        }
    }, []);

    useEffect(() => {
        if (clearTrigger === 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        context.clearRect(0, 0, canvas.width, canvas.height);

    }, [clearTrigger])

    // Get mouse/pointer position relative to canvas
    const getPosition = (
        event: React.PointerEvent<HTMLCanvasElement>
    ) => {
        const canvas = canvasRef.current;

        if (!canvas) return null;

        const rect = canvas.getBoundingClientRect();

        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    };

    // Start drawing
    const startDrawing = (
        event: React.PointerEvent<HTMLCanvasElement>
    ) => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const context = canvas.getContext("2d");

        if (!context) return;

        const position = getPosition(event);

        if (!position) return;

        context.beginPath();
        context.moveTo(position.x, position.y)

        context.strokeStyle = color;
        context.lineWidth = brushSize;
        context.lineCap = "round";
        context.lineJoin = "round";

        canvas.setPointerCapture(event.pointerId);

        setIsDrawing(true);
    }

    // Draw
    const draw = (
        event: React.PointerEvent<HTMLCanvasElement>
    ) => {
        
        if (!isDrawing) return;

        const canvas = canvasRef.current;

        if (!canvas) return;

        const context = canvas.getContext("2d");

        if (!context) return;

        const position = getPosition(event);

        if (!position) return;

        context.lineTo(position.x, position.y);
        context.stroke();

    }

    // Stop drawing
    const stopDrawing = (
        event: React.PointerEvent<HTMLCanvasElement>
    ) => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        if (canvas.hasPointerCapture(event.pointerId)) {
            canvas.releasePointerCapture(event.pointerId);
        }

        setIsDrawing(false);

    };

    return(
        <div className="w-125 h-187.5 flex flex-col gap-3.5">
            <div className="drawing-area">
                <canvas
                    ref={canvasRef}
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={stopDrawing}
                    onPointerCancel={stopDrawing}
                    onPointerLeave={stopDrawing}
                />
            </div>
        </div>
    )
}