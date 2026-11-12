import type { ReactNode } from "react"

interface PinBoxType {
    children: ReactNode;
    className?: string;
}

export default function PinBox( {children, className = ""}: PinBoxType) {
    return(
        <div className={`p-2 border border-olive-300 rounded-3xl ${className}`}>
            {children}
        </div>
    )
}