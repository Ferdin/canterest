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
import RangeSlider from "./RangeSlider.tsx";

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

            <div className="flex flex-row justify-between items-center">
                <span className="font-semibold">Style</span>
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
                                 key={id}           
                            >
                                {label}
                            </div>    
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-row justify-between">
                <span className="font-semibold">Color</span>
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
                <span className="font-semibold">Size</span>
                <RangeSlider
                    label="Brush size"
                    min={1}
                    max={50}
                    value={brushSize}
                    onChange={(v) => dispatch(setBrushSize(v))}
                />
            </div>
            <div className="flex flex-row justify-between items-center">
                <span className="font-semibold">Opacity</span>
                <div className="flex items-center gap-2">
                <RangeSlider
                    label="Opacity"
                    min={0}
                    max={100}
                    value={Math.round(opacity * 100)}
                    onChange={(v) => dispatch(setOpacity(v / 100))}
                    formatValue={(v) => `${v}%`}
                />
                </div>
            </div>
            <div className="flex flex-row justify-between">
                <span className="font-semibold">Clear</span>
                <button onClick={() => dispatch(triggerClear())}>
                    Clear
                </button>
            </div>
        </div>
    )
}