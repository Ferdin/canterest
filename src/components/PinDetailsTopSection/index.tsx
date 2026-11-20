import { ArrowLeft, ChevronDown, Ellipsis, Heart, MessageCircle, Share } from "lucide-react";
import { useGetPinDetailQuery, useToggleLikeMutation, type PinOut } from "../../features/pins/pinsApi";

export default function PinDetailsTopSection({ pinId }: { pinId: PinOut["id"] }) {
    const [toggleLike] = useToggleLikeMutation();
    const { data: pin, isLoading, isError } = useGetPinDetailQuery(pinId);

    if (isLoading) {
        return <p className="px-2 py-4 text-sm text-gray-500">Loading…</p>;
    }

    if (isError || !pin) {
        return <p className="px-2 py-4 text-sm text-red-600">Couldn't load this pin.</p>;
    }

    return (
        <div className="flex flex-row justify-between ">
            <div className="flex flex-row items-center gap-2">
                <ArrowLeft/>
                <button
                    type="button"
                    onClick={() => toggleLike({ pinId, liked: pin.liked_by_me })}
                    aria-pressed={pin.liked_by_me}
                    aria-label={pin.liked_by_me ? "Unlike" : "Like"}
                    className="flex w-fit items-center gap-2 rounded-full py-1 hover:bg-olive-100"
                >
                    <Heart
                        size={20}
                        className={pin.liked_by_me ? "fill-red-500 text-red-500" : "text-gray-700"}
                    />
                    <span className="text-sm font-medium">{pin.like_count}</span>
                </button>
                <MessageCircle size={20}/>
                <Share size={20}/>
                <Ellipsis size={20}/>
            </div>
            <div className="flex flex-row items-center gap-2">
                <button className="flex flex-row gap-2 items-center px-2 py-2 pl-3 bg-olive-300 rounded-xl">
                    Profile
                    <ChevronDown size={20}/>
                </button>
                <button className="px-4 py-2 bg-red-500 text-white rounded-xl">
                    Save
                </button>
            </div>
        </div>
    )
}