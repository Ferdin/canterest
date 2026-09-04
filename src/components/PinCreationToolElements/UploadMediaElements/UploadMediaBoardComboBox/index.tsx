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
                className="border-gray-300 border rounded-2xl h-18 w-full px-4 pt-5 pb-1 outline-none text-base transition-all focus:border-black" 
                role="combobox" 
                aria-expanded={isOpen} 
                aria-controls="board-listbox" 
                aria-autocomplete="list" 
            />
            {/**
             * Floating label
             */}
            <label htmlFor="can_pin_board" className="absolute left-4 top-2 text-xs font-semibold text-gray-800 pointer-events-none" > Board </label>
            {/**
             * Dropdown
             */}
             {isOpen && (
                <div
                    id="board-listbox"
                    role="listbox"
                    className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden z-50"
                >
                    {filteredBoards.length > 0 ? (
                        <div className="py-2">
                            {filteredBoards.map((board, index) => (
                                <button
                                    key={board.id}
                                    type="button"
                                    role="option"
                                    aria-selected={
                                        selectedBoard?.id === board.id
                                    }
                                    onMouseDown={(event) => {
                                        event.preventDefault();
                                    }}
                                    onClick={()=>
                                        handleSelectBoard(board)
                                    }
                                    className={
                                        `w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                                            index === highlightedIndex
                                                ? "bg-gray-100"
                                                : "hover:bg-ray-50"
                                        }`
                                    }
                                >
                                    {/*Board icon*/}
                                    <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                                        <span className="text-gray-500">
                                            📌
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                        {board.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    ): (
                        <div className="border-t border-gray-100">
                            <button
                                type="button"
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                }}
                                onClick={()=>{
                                    console.log("Create new board");
                                }}
                                className="w-full px-4 py-4 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center">
                                    <span className="text-xl">+</span>
                                </div>
                                <span className="text-sm font-semibold text-gray-900">
                                    Create new board
                                </span>
                            </button>
                        </div>
                    )}
                </div>    
             )}
        </div>
    );
}