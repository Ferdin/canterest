import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    useEffect(() => {
        if (!isOpen) return;

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEsc);

        // lock background scroll while modal is open
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = originalOverflow;

        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = originalOverflow;
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4"
                onClick={(e) => e.stopPropagation()} // prevent backdrop click from closing when clicking inside
            >
                <div
                    className="flex justify-between items-center px-6 py-4 border-b border-gray-200"
                >
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button onClick={onClose} className="cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="px-6 py-5">{children}</div>
            </div>
        </div>
    )
}