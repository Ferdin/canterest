import { useRef, useState } from "react";
import { X, ImagePlus } from "lucide-react";
import { useAppDispatch } from "../../../app/hooks";
import { requestAddImages, setActiveTool } from "../../../features/canvas/canvasSlice";

export default function ImageComponents() {
    const dispatch = useAppDispatch();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const addFiles = (files: FileList | null) => {
        if (!files) return;
        const srcs = [...files]
            .filter((file) => file.type.startsWith("image/"))
            .map((file) => URL.createObjectURL(file));
        if (srcs.length) dispatch(requestAddImages(srcs));
    };

    return (
        <div className="flex flex-col gap-6" data-drawing-tools>
            <div className="flex flex-row justify-between py-4">
                <span className="font-medium text-xl">Image tools</span>
                <button
                    type="button"
                    aria-label="Close image tools"
                    onClick={() => dispatch(setActiveTool(null))}
                >
                    <X />
                </button>
            </div>

            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    addFiles(e.dataTransfer.files);
                }}
                className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center ${
                    isDragOver ? "border-gray-900 bg-gray-50" : "border-gray-300"
                }`}
            >
                <ImagePlus size={32} className="text-gray-500" />
                <p className="text-sm text-gray-600">Drag images here, or</p>
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="rounded-full bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-700"
                >
                    Upload images
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                        addFiles(e.target.files);
                        e.target.value = ""; // lets you pick the same file again
                    }}
                />
            </div>

            <p className="text-sm text-gray-500">
                Drag an image on the artboard to move it, and drag its corner handle to resize.
                Delete or Backspace removes the selected image.
            </p>
        </div>
    );
}