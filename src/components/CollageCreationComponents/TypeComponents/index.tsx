import { X } from "lucide-react";
import { useAppDispatch } from "../../../app/hooks";
import { setActiveTool } from "../../../features/canvas/canvasSlice";

export default function TypeComponents() {
    const dispatch = useAppDispatch();

    return (
        <div className="flex flex-col gap-6" data-drawing-tools>
            <div className="flex flex-row justify-between py-4">
                <span className="font-medium text-xl">Text tools</span>
                <button
                    type="button"
                    aria-label="Close text tools"
                    className="hover:cursor-pointer"
                    onClick={() => dispatch(setActiveTool(null))}
                >
                    <X />
                </button>
            </div>
            {/* font, size, color, alignment controls go here */}
        </div>
    )
}