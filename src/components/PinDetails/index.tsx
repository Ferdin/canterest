import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Heart, SendHorizontal } from "lucide-react";
import {
    useGetPinDetailQuery,
    useGetPinCommentsQuery,
    useAddCommentMutation,
    useToggleLikeMutation,
    type PinOut,
    type PinUser,
} from "../../features/pins/pinsApi";

function Avatar({ user, size = 32 }: { user: PinUser; size?: number }) {
    return user.avatar_url ? (
        <img
            src={user.avatar_url}
            alt=""
            className="shrink-0 rounded-full object-cover"
            style={{ width: size, height: size }}
        />
    ) : (
        <span
            className="flex shrink-0 items-center justify-center rounded-full bg-olive-300 text-sm font-semibold"
            style={{ width: size, height: size }}
        >
            {user.username.charAt(0).toUpperCase()}
        </span>
    );
}

export default function PinDetails({ pinId }: { pinId: PinOut["id"] }) {
    const { data: pin, isLoading, isError } = useGetPinDetailQuery(pinId);
    const { data: comments = [], isLoading: commentsLoading } = useGetPinCommentsQuery(pinId);
    const [toggleLike] = useToggleLikeMutation();
    const [addComment, { isLoading: posting }] = useAddCommentMutation();

    const [draft, setDraft] = useState("");
    const [postError, setPostError] = useState<string | null>(null);

    const submitComment = async (event: FormEvent) => {
        event.preventDefault();
        const body = draft.trim();
        if (!body) return;

        setPostError(null);
        try {
            await addComment({ pinId, body }).unwrap();
            setDraft("");
        } catch {
            setPostError("Couldn't post your comment. Please try again.");
        }
    };

    if (isLoading) {
        return <p className="px-2 py-4 text-sm text-gray-500">Loading…</p>;
    }

    if (isError || !pin) {
        return <p className="px-2 py-4 text-sm text-red-600">Couldn't load this pin.</p>;
    }

    return (
        <div className="flex flex-col gap-4 px-2 pt-4 pb-2">
            {/* Creator */}
            <Link to={`/${pin.creator.username}`} className="flex items-center gap-2 hover:underline">
                <Avatar user={pin.creator} />
                <span className="text-sm font-semibold">{pin.creator.username}</span>
            </Link>

            {(pin.title || pin.description) && (
                <div>
                    {pin.title && <h3 className="font-semibold">{pin.title}</h3>}
                    {pin.description && <p className="mt-1 text-sm text-gray-700">{pin.description}</p>}
                </div>
            )}

            {/* Likes */}
            <button
                type="button"
                onClick={() => toggleLike({ pinId, liked: pin.liked_by_me })}
                aria-pressed={pin.liked_by_me}
                aria-label={pin.liked_by_me ? "Unlike" : "Like"}
                className="flex w-fit items-center gap-2 rounded-full px-2 py-1 hover:bg-olive-100"
            >
                <Heart
                    size={20}
                    className={pin.liked_by_me ? "fill-red-500 text-red-500" : "text-gray-700"}
                />
                <span className="text-sm font-medium">{pin.like_count}</span>
            </button>

            {/* Comments */}
            <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold">
                    {comments.length === 1 ? "1 comment" : `${comments.length} comments`}
                </span>

                {commentsLoading ? (
                    <p className="text-sm text-gray-500">Loading comments…</p>
                ) : (
                    comments.length > 0 && (
                        <ul className="flex max-h-60 flex-col gap-3 overflow-y-auto pr-1">
                            {comments.map((comment) => (
                                <li key={comment.id} className="flex gap-2">
                                    <Avatar user={comment.author} size={28} />
                                    <div className="min-w-0">
                                        <p className="text-sm wrap-break-word">
                                            <Link
                                                to={`/${comment.author.username}`}
                                                className="mr-1 font-semibold hover:underline"
                                            >
                                                {comment.author.username}
                                            </Link>
                                            {comment.body}
                                        </p>
                                        <time
                                            dateTime={comment.created_at}
                                            className="text-xs text-gray-500"
                                        >
                                            {new Date(comment.created_at).toLocaleDateString()}
                                        </time>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )
                )}
            </div>

            {/* Add a comment */}
            <form onSubmit={submitComment} className="flex flex-col gap-1">
                <div className="flex items-center gap-2 rounded-full border border-olive-300 px-3 py-1">
                    <input
                        type="text"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Add a comment"
                        aria-label="Add a comment"
                        className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-none"
                    />
                    <button
                        type="submit"
                        disabled={posting || !draft.trim()}
                        aria-label="Post comment"
                        className="rounded-full p-1 text-gray-700 hover:bg-olive-100 disabled:opacity-40"
                    >
                        <SendHorizontal size={18} />
                    </button>
                </div>
                {postError && (
                    <p role="alert" className="px-3 text-xs text-red-600">
                        {postError}
                    </p>
                )}
            </form>
        </div>
    );
}