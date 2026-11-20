import type { ReactNode } from "react"

interface PinBoxType {
    children: ReactNode;
    className?: string;
    selected?: boolean;
}

export default function PinBox( {children, className = "", selected = false}: PinBoxType) {
    return(
        <div className={`p-2 border rounded-3xl transition-colors ${
            selected ? "border-olive-300" : "border-transparent"
        } ${className}`}>
            {children}
        </div>
    )
}