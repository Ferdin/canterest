import type { ReactNode } from "react"

interface PinBoxType {
    children: ReactNode;
}

export default function PinBox( {children}: PinBoxType) {
    return(
        <div className="p-2 border border-olive-300 rounded-3xl">
            {children}
        </div>
    )
}