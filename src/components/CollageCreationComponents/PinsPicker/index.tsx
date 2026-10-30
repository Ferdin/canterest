import { useState } from "react";
import { Plus } from "lucide-react";
import { useAppDispatch } from "../../../app/hooks";
import { requestAddImages } from "../../../features/canvas/canvasSlice";
import { useGetPinsQuery } from "../../../features/pins/pinsApi";
import type { PinOut } from "../../../features/pins/pinsApi";
import Loading from "../../MiscAnimatedComponents/Loading";

export default function PinsPicker() {
    const dispatch = useAppDispatch();
    const { data: pins = [], isLoading, isError, refetch } = useGetPinsQuery();
    const [addingId, setAddingId] = useState<PinOut["id"] | null>(null);
    const [addError, setAddError] = useState<string | null>(null);

    const addPin = async (pin: PinOut) => {
        setAddingId(pin.id);
        setAddError(null);
        try {
            // Download first so the canvas gets a same-origin blob URL (keeps export working).
            const response = await fetch(pin.media_url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const blob = await response.blob();
            dispatch(requestAddImages([URL.createObjectURL(blob)]));
        } catch {
            setAddError("Couldn't add that pin. Please try again.");
        } finally {
            setAddingId(null);
        }
    };

    return (
        <div className="flex flex-col gap-4" data-drawing-tools>
            <div className="py-4">
                <span className="font-medium text-xl">Add pins</span>
                <p className="mt-1 text-sm text-gray-500">Click a pin to add it to your collage.</p>
            </div>

            {addError && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {addError}
                </p>
            )}

            {isLoading && (
                <div className="flex justify-center py-10">
                    <Loading />
                </div>
            )}

            {isError && (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <p className="text-gray-600">Couldn't load pins.</p>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="rounded-full bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-700"
                    >
                        Try again
                    </button>
                </div>
            )}

            {!isLoading && !isError && pins.length === 0 && (
                <p className="py-10 text-center text-gray-600">No pins yet.</p>
            )}

            {pins.length > 0 && (
                <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                    <div className="columns-2 gap-3">
                        {pins.map((pin) => {
                            const isAdding = addingId === pin.id;
                            return (
                                <button
                                    key={pin.id}
                                    type="button"
                                    disabled={addingId !== null}
                                    onClick={() => addPin(pin)}
                                    aria-label={`Add ${pin.title || "pin"} to collage`}
                                    className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-2xl disabled:cursor-wait"
                                >
                                    <img
                                        src={pin.media_url}
                                        alt=""
                                        loading="lazy"
                                        draggable={false}
                                        className="w-full bg-gray-100"
                                    />
                                    <span
                                        className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity ${
                                            isAdding ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                                        }`}
                                    >
                                        {isAdding ? (
                                            <span className="text-sm font-medium text-white">Adding…</span>
                                        ) : (
                                            <span className="rounded-full bg-white p-2 shadow">
                                                <Plus size={18} />
                                            </span>
                                        )}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}