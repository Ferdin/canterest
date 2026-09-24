import { X, Eraser, Pencil, Sparkles, SprayCan, Highlighter } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { 
    setColor, 
    setBrushSize, 
    triggerClear,
    setBrushStyle,
    setOpacity,
    type BrushStyle, 
} from "../../../features/canvas/canvasSlice";

const BRUSHES: { id: BrushStyle; label: string; Icon: typeof Pencil }[] = [
    { id: "eraser", label: "Eraser", Icon: Eraser },
    { id: "pencil", label: "Pencil", Icon: Pencil },
    { id: "glow", label: "Glow", Icon: Sparkles },
    { id: "spray", label: "Spray", Icon: SprayCan },
    { id: "crayon", label: "Crayon", Icon: Highlighter },
]

export default function CanvasComponents() {
    const dispatch = useAppDispatch();
    const color = useAppSelector((state) => state.canvas.color);
    const brushSize = useAppSelector((state) => state.canvas.brushSize);
    const brushStyle = useAppSelector((state) => state.canvas.brushStyle);
    const opacity = useAppSelector((state) => state.canvas.opacity);

    return(
        <div className="flex flex-col gap-6">
            <div className="flex flex-row justify-between py-4">
                <span className="font-medium text-xl ">Drawing tools</span>
                <X/>
            </div>

            <div className="flex flex-row justify-between">
                <span>Style</span>
                <div className="flex flex-row gap-6">
                    {BRUSHES.map(({ id, label, Icon }) => (
                        <div className="relative group inline-block">
                            <button
                                key={id}
                                type="button"
                                title={label}
                                aria-pressed={brushStyle === id}
                                onClick={() => dispatch(setBrushStyle(id))}
                                className={`flex flex-col items-center p-2 rounded-lg ${
                                    brushStyle === id
                                    ? "border-black bg-gray-100"
                                    : "border-gray-200 hover:bg-gray-50"
                                }`}
                            >
                                <Icon size={24} />
                            </button>
                            <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2
                                            hidden group-hover:block
                                            whitespace-nowrap rounded bg-gray-800 px-2 py-1
                                            text-sm text-white"
                            >
                                {label}
                            </div>    
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-row justify-between">
                <span>Color</span>
                {/* <input 
                    type="color"
                    value={color}
                    onChange={(event) => dispatch(setColor(event.target.value))}
                    className="rounded-lg"
                /> */}
                <div className="relative">
                    <input
                        type="color"
                        value={color}
                        onChange={(event) => dispatch(setColor(event.target.value))}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                    <div
                        className="h-8 w-8 cursor-pointer rounded-md border border-gray-300"
                        style={{ backgroundColor: color }}
                    />
                </div>
            </div>
            <div className="flex flex-row justify-between">
                <span>Size</span>
                <input
                    type="range"
                    min="1"
                    max="50"
                    value={brushSize}
                    onChange={(event) => 
                        dispatch(setBrushSize(Number(event.target.value)))
                    }
                    className="
                        h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200

                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:h-4
                        [&::-webkit-slider-thumb]:w-4
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-blue-600

                        [&::-moz-range-thumb]:h-4
                        [&::-moz-range-thumb]:w-4
                        [&::-moz-range-thumb]:cursor-pointer
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:border-0
                        [&::-moz-range-thumb]:bg-blue-600
                    "
                />
            </div>
            <div className="flex flex-row justify-between items-center">
                <span>Opacity</span>
                <div className="flex items-center gap-2">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(opacity * 100)}
                    onChange={(event) =>
                    dispatch(setOpacity(Number(event.target.value) / 100))
                    }
                />
                </div>
            </div>
            <div className="flex flex-row justify-between">
                <span>Clear</span>
                <button onClick={() => dispatch(triggerClear())}>
                    Clear
                </button>
            </div>
        </div>
    )
}