import { useEffect, useRef, useState } from "react";

interface Board {
    id: string | number;
    name: string;
}

const boards:Board[] = [
    { id: 1, name: "Web Development" },
    { id: 2, name: "Travel" },
    { id: 3, name: "Photography" },
    { id: 4, name: "Food" },
    { id: 5, name: "Interior Design" }
]

export default function UploadMediaBoardComboBox() {
    
    const [query, setQuery] = useState<string>("");
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedBoard, setSelectedBoard] = useState<Board | null>();
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef(null);

    const filteredBoards = boards.filter((board) => 
        board.name.toLowerCase().includes(query.toLowerCase())
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    },[]);

    const handleSelectBoard = (board: Board) => {
        setSelectedBoard(board);
        setQuery(board.name);
        setIsOpen(false);
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) {
            if (event.key === "ArrowDown" || event.key === "Enter") {
                setIsOpen(true);
            }
            return;
        }

        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();

                setHighlightedIndex((current) =>
                    current < filteredBoards.length - 1
                    ? current + 1
                    : 0
                );

                break;

            case "ArrowUp":
                event.preventDefault();
                
                setHighlightedIndex((current) =>
                    current > 0
                        ? current - 1
                        : filteredBoards.length - 1
                );

                break;

            case "Enter":
                event.preventDefault();
                
                if (filteredBoards[highlightedIndex]) {
                    handleSelectBoard(filteredBoards[highlightedIndex]);
                }

                break;

            case "Escape":
                setIsOpen(false);
                break;
                
            default:
                break;    
        }
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
        setSelectedBoard(null);
        setHighlightedIndex(0);
        setIsOpen(true);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-lg"
        >
            <input 
                ref={inputRef} 
                type="text" 
                name="can_pin_board" 
                id="can_pin_board" 
                value={query} 
                placeholder="Search for a board." 
                autoComplete="off" 
                onFocus={() => setIsOpen(true)} 
                onChange={handleInputChange} 
                onKeyDown={handleKeyDown} 
                className="border-gray-300 border rounded-2xl h-18 w-full px-4 pt-5 pb-1 outline-none text-base transition-all focus:border-black" role="combobox" aria-expanded={isOpen} aria-controls="board-listbox" aria-autocomplete="list" 
            />
            <label htmlFor="can_pin_board" className="absolute left-4 top-2 text-xs font-semibold text-gray-800 pointer-events-none" > Board </label>
        </div>
    );
}