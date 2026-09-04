import { useEffect, useRef, useState } from "react";

export interface ComboBoxItem {
    id: string | number;
    name: string;
}

interface ComboBoxProps <T extends ComboBoxItem> {
    items: T[];
    label: string;
    name: string;
    id: string;
    placeholder?: string;

    multiple?: boolean;

    value: T | T[] | null;
    onChange: (value: T | T[] | null) => void;

    onCreateNew?: (query: string) => void;
    createLabel?: (query: string) => string;

    renderIcon?: (item: T) => React.ReactNode;
}

function toArray<T>(value: T | T[] | null): T[] {
    if (value == null) return [];
    return Array.isArray(value) ? value : [value];
}

export default function UploadMediaGenericComboBox<T extends ComboBoxItem>({
    items,
    label,
    name,
    id,
    placeholder = "Search...",
    multiple = false,
    value,
    onChange,
    onCreateNew,
    createLabel = (query) => `Create "${query}"`,
    renderIcon,
}:ComboBoxProps<T>){
    const [query, setQuery] = useState<string>("");
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const selectedItems = toArray(value);
    const selectedIds = new Set(selectedItems.map((item) => item.id));

    // In single mode the input mirrors the selected item's name when closed.
    useEffect(() => {
        if (!multiple && !isOpen) {
            setQuery(selectedItems[0]?.name ?? "");
        }
    }, [value, multiple, isOpen]);

    const filteredItems = items.filter((item) => {
        const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase());
        // In multi mode, already-selected items are excluded from the list.
        if (multiple && selectedIds.has(item.id)) return false;
        return matchesQuery;
    });

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
        };
    }, []);

    const handleSelect = (item: T) => {
        if (multiple) {
            onChange([...selectedItems, item]);
            setQuery("");
            setHighlightedIndex(0);
            inputRef.current?.focus();
        } else {
            onChange(item);
            setQuery(item.name);
            setIsOpen(false);
        }
    };

    const handleRemove = (itemId: T["id"]) => {
        if (!multiple) {
            onChange(null);
            setQuery("");
            return;
        }
        onChange(selectedItems.filter((item) => item.id !== itemId));
    };

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
                    current < filteredItems.length - 1 ? current + 1 : 0
                );
                break;
            
            case "ArrowUp":
                event.preventDefault();
                setHighlightedIndex((current) => 
                    current > 0 ? current - 1 : filteredItems.length - 1
                );
                break;

            case "Enter":
                event.preventDefault();
                if (filteredItems[highlightedIndex]) {
                    handleSelect(filteredItems[highlightedIndex]);
                } else if (filteredItems.length === 0 && query && onCreateNew) {
                    onCreateNew(query);
                    setQuery("");
                }
                break;
            
            case "Backspace":
                if (multiple && query === "" && selectedItems.length > 0) {
                    handleRemove(selectedItems[selectedItems.length - 1].id);
                }
                break;

            case "Escape":
                setIsOpen(false);
                break;
                
            default:
                break;    
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
        if (!multiple) onChange(null);
        setHighlightedIndex(0);
        setIsOpen(true);
    };

    return (
        <div ref={containerRef} className="relative w-lg">
            {/* Multi-select tags render above the input, single-select reuses the input itself */}
            {multiple && selectedItems.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {selectedItems.map((item) => (
                        <span
                            key={item.id}
                            className="inline-flex items-center gap-1 bg-gray-100 text-gray-900 text-sm font-medium px-3 py-1 rounded-full"
                        >
                            {item.name}
                            <button
                                type="button"
                                onClick={() => handleRemove(item.id)}
                                aria-label={`Remove ${item.name}`}
                                className="text-gray-500 hover:text-gray-800"
                            >
                                &times;
                            </button>
                        </span>
                    ))}
                </div>
            )}
 
            <input
                ref={inputRef}
                type="text"
                name={name}
                id={id}
                value={query}
                placeholder={placeholder}
                autoComplete="off"
                onFocus={() => setIsOpen(true)}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="border-gray-300 border rounded-2xl h-18 w-full px-4 pt-5 pb-1 outline-none text-base transition-all focus:border-black"
                role="combobox"
                aria-expanded={isOpen}
                aria-controls={`${id}-listbox`}
                aria-autocomplete="list"
            />
            {/* Floating label */}
            <label
                htmlFor={id}
                className="absolute left-4 top-2 text-xs font-semibold text-gray-800 pointer-events-none"
            >
                {label}
            </label>
 
            {/* Dropdown */}
            {isOpen && (
                <div
                    id={`${id}-listbox`}
                    role="listbox"
                    className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden z-50"
                >
                    {filteredItems.length > 0 ? (
                        <div className="py-2">
                            {filteredItems.map((item, index) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    role="option"
                                    aria-selected={selectedIds.has(item.id)}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => handleSelect(item)}
                                    className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                                        index === highlightedIndex
                                            ? "bg-gray-100"
                                            : "hover:bg-gray-50"
                                    }`}
                                >
                                    <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                                        {renderIcon ? (
                                            renderIcon(item)
                                        ) : (
                                            <span className="text-gray-500">•</span>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                        {item.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        onCreateNew && (
                            <div className="border-t border-gray-100">
                                <button
                                    type="button"
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => {
                                        onCreateNew(query);
                                        setQuery("");
                                    }}
                                    className="w-full px-4 py-4 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center">
                                        <span className="text-xl">+</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {createLabel(query)}
                                    </span>
                                </button>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    )
}