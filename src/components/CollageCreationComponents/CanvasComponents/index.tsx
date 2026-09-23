import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { setColor, setBrushSize, triggerClear } from "../../../features/canvas/canvasSlice"

export default function CanvasComponents() {
    const dispatch = useAppDispatch();
    const color = useAppSelector((state) => state.canvas.color);
    const brushSize = useAppSelector((state) => state.canvas.brushSize);

    return(
        <div className="toolbar">
            <label>
                Color
                <input 
                    type="color"
                    value={color}
                    onChange={(event) => dispatch(setColor(event.target.value))}
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
                        dispatch(setBrushSize(Number(event.target.value)))
                    }
                />
            </label>

            <span>{brushSize}px</span>

            <button onClick={() => dispatch(triggerClear())}>
                Clear
            </button>
        </div>
    )
}