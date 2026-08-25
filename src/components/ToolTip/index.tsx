import { type ReactNode } from "react";

interface TooltipProps {
    children: ReactNode;
    content: ReactNode;
    position?: "top" | "bottom" | "left" | "right";
}

export default function Tooltip({
    children,
    content,
    position = "top",
} : TooltipProps) {
    const positions = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
        left: "right-full top-1/2 -translate-y-1/2 mr-2",
        right: "left-full top-1/2 -translate-y-1/2 ml-2"
    };

    return (
        <div className="group relative inline-flex">
            {children}
            <div 
               role="tooltip" 
               className={`
                pointer-events-none absolute z-50
                ${positions[position]}
                whitespace-nowrap
                rounded-md bg-gray-900 px-3 py-1.5
                text-sm text-white
                opacity-0 transition-opacity duration-150
                group-hover:opacity-100
               `}
            >
                {content}
            </div>
        </div>
    )
}