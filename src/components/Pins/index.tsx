import { useState } from "react";
import { useGetPinsQuery, type PinOut } from "../../features/pins/pinsApi"
import Loading from "../MiscAnimatedComponents/Loading";
import PinBox from "../PinBox";
import PinDetails from "../PinDetails";

const [openPinId, setOpenPinId] = useState<PinOut["id"] | null>(null);

export default function Pins() {
    const { data: pins = [], isLoading, isError, refetch } = useGetPinsQuery();

    if (isLoading) {
        return (
            <div className="flex justify-center py-16">
                <Loading/>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
                <p className="text-gray-600">Couldn't load pins</p>
                <button
                    type="button"
                    onClick={() => refetch()}
                    className="rounded-full bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-700"
                >
                    Try again
                </button>
            </div>
        )
    }

    if (pins.length === 0) {
        return <p className="py-16 text-center text-gray-600">No pins yet.</p>
    }

    return (
        <div className="columns-2 gap-4 px-4 py-4 sm:columns-3 lg:columns-4 xl:columns-5">
            {pins.map((pin) => {
                const isOpen = openPinId === pin.id;
                return (
                    <PinBox key={pin.id} className="mb-4 break-inside-avoid">
                        <article>
                            <button
                                type="button"
                                onClick={() => setOpenPinId(isOpen ? null : pin.id)}
                                aria-expanded={isOpen}
                                aria-label={isOpen ? "Close pin details" : `Open ${pin.title || "pin"}`}
                                className="block w-full cursor-pointer"
                            >
                                <img
                                    src={pin.media_url}
                                    alt={pin.title ?? ""}
                                    loading="lazy"
                                    crossOrigin="anonymous"
                                    className="w-full rounded-2xl bg-gray-100"
                                />
                            </button>
                            {isOpen && <PinDetails pinId={pin.id} />}
                        </article>
                    </PinBox>
                );
            })}
        </div>
    );
}