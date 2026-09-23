import { X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { setColor, setBrushSize, triggerClear } from "../../../features/canvas/canvasSlice"

export default function CanvasComponents() {
    const dispatch = useAppDispatch();
    const color = useAppSelector((state) => state.canvas.color);
    const brushSize = useAppSelector((state) => state.canvas.brushSize);

    return(
        <div>
            <div className="px-6">
                <div className="flex flex-row justify-between">
                    <span className="font-medium text-xl">Drawing tools</span>
                    <X/>
                </div>
                <div className="flex flex-row justify-between">
                    <span>Color</span>
                    <input 
                        type="color"
                        value={color}
                        onChange={(event) => dispatch(setColor(event.target.value))}
                    />
                </div>
                <div className="flex flex-row justify-between">
                    <span>Brush</span>
                    <input
                        type="range"
                        min="1"
                        max="50"
                        value={brushSize}
                        onChange={(event) => 
                            dispatch(setBrushSize(Number(event.target.value)))
                        }
                    />
                </div>
                <div className="flex flex-row justify-between">
                    <span>Clear</span>
                    <button onClick={() => dispatch(triggerClear())}>
                        Clear
                    </button>
                </div>
            </div>
        </div>
    )
}