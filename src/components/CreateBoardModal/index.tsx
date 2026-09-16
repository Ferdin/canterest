import { useState } from "react";
import Modal from "../Modal";
import { useCreateBoardMutation } from "../../features/boards/boardsApi";

interface CreateBoardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateBoardModal({ isOpen, onClose }: CreateBoardModalProps) {
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [isSecret, setIsSecret] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [createBoard, { isLoading }] = useCreateBoardMutation();

    const handleClose = () => {
        setName("");
        setDescription("");
        setIsSecret(false);
        setErrorMsg(null);
        onClose();
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        
        if(!name.trim()) {
            setErrorMsg("Board name is required.");
            return;
        }

        try {
            await createBoard({ name: name.trim(), description: description.trim() || undefined, is_secret: isSecret }).unwrap();
            handleClose();
        } catch (err: any) {
            const detail = err?.data?.detail;
            setErrorMsg(
                typeof detail === "string"
                    ? detail
                    : Array.isArray(detail)
                    ? detail[0]?.msg
                    : "Failed to create board. Please try again."
            );
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Create Board">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label htmlFor="board_game" className="text-sm font-semibold">
                        Name
                    </label>
                    <input
                        id="board_name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Like &quot;Places to Go&quot; or &quot;Recipes to Make&quot;"
                        className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-red-500"
                        autoFocus
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="board_description" className="text-sm font-semibold">
                        Description <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                        id="board_description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What's your board about"
                        className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-red-500 resize-none h-20"
                    />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isSecret}
                        onChange={(e) => setIsSecret(e.target.checked)}
                    />
                    <span className="text-sm">Keep this board secret</span>
                </label>

                {errorMsg && <span className="text-sm text-red-600">{errorMsg}</span>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-red-600 text-white py-2.5 rounded-full font-semibold hover:bg-red-700 cursor-pointer disabled:opacity-60 mt-2"
                >
                    {isLoading ? "Creating..." : "Create"}
                </button>
            </form>
        </Modal>
    )
}