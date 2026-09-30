import { X, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
    setActiveTool,
    setTextStyle,
    triggerAddText,
    TEXT_FONTS,
    type TextAlign,
} from "../../../features/canvas/canvasSlice";
import RangeSlider from "../CanvasComponents/RangeSlider.tsx";

const ALIGNMENTS: { id: TextAlign; label: string; Icon: typeof AlignLeft }[] = [
    { id: "left", label: "Align left", Icon: AlignLeft },
    { id: "center", label: "Align center", Icon: AlignCenter },
    { id: "right", label: "Align right", Icon: AlignRight },
];

export default function TypeComponents() {
    const dispatch = useAppDispatch();
    const textStyle = useAppSelector((state) => state.canvas.textStyle);

    return (
        <div className="flex flex-col gap-6" data-drawing-tools>
            <div className="flex flex-row justify-between py-4">
                <span className="font-medium text-xl">Text tools</span>
                <button
                    type="button"
                    aria-label="Close text tools"
                    onClick={() => dispatch(setActiveTool(null))}
                >
                    <X />
                </button>
            </div>

            <div className="flex flex-col gap-2">
                <button
                    type="button"
                    onClick={() => dispatch(triggerAddText())}
                    className="rounded-full bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-700"
                >
                    Add text
                </button>
                <p className="text-sm text-gray-500">
                    Or click anywhere on the artboard. Double-click text to edit it.
                </p>
            </div>

            <div className="flex flex-row justify-between items-center gap-4">
                <span>Font</span>
                <select
                    value={textStyle.fontFamily}
                    onChange={(e) => dispatch(setTextStyle({ fontFamily: e.target.value }))}
                    className="w-44 rounded-lg border border-gray-300 px-2 py-1.5"
                    style={{ fontFamily: textStyle.fontFamily }}
                >
                    {TEXT_FONTS.map((font) => (
                        <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                            {font.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-row justify-between items-center">
                <span>Size</span>
                <RangeSlider
                    label="Font size"
                    min={8}
                    max={120}
                    value={textStyle.fontSize}
                    onChange={(v) => dispatch(setTextStyle({ fontSize: v }))}
                    formatValue={(v) => `${v}px`}
                />
            </div>

            <div className="flex flex-row justify-between items-center">
                <span>Color</span>
                <input
                    type="color"
                    value={textStyle.color}
                    onChange={(e) => dispatch(setTextStyle({ color: e.target.value }))}
                />
            </div>

            <div className="flex flex-row justify-between items-center">
                <span>Alignment</span>
                <div className="flex gap-1 rounded-lg bg-gray-100 p-1" role="group" aria-label="Text alignment">
                    {ALIGNMENTS.map(({ id, label, Icon }) => (
                        <button
                            key={id}
                            type="button"
                            title={label}
                            aria-label={label}
                            aria-pressed={textStyle.align === id}
                            onClick={() => dispatch(setTextStyle({ align: id }))}
                            className={`rounded-md p-1.5 ${
                                textStyle.align === id ? "bg-white shadow-sm" : "hover:bg-gray-200"
                            }`}
                        >
                            <Icon size={18} />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}