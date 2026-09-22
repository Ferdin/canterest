import { useEffect, useRef, useState } from "react";
import "./index.css";

export default function Canvas(){
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [color, setColor] = useState("#000000");
    const [brushSize, setBrushSize] = useState<number>(5);

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

    // Clear canvas
    const clearCanvas = () => {
        const canvas = canvasRef.current;
        
        if (!canvas) return;

        const context = canvas.getContext("2d");

        if (!context) return;

        context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );
    };

    return(
        <div className="drawing-tool">
            <div className="toolbar">
                <label>
                    Color
                    <input 
                        type="color"
                        value={color}
                        onChange={(event) => setColor(event.target.value)}
                    />
                </label>

                <label>
                    Brush size
                    <input
                        type="range"
                        min="1"
                        max="50"
                        value={brushSize}
                        onChange={(event) => 
                            setBrushSize(Number(event.target.value))
                        }
                    />
                </label>

                <span>{brushSize}px</span>

                <button onClick={clearCanvas}>
                    Clear
                </button>
            </div>
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