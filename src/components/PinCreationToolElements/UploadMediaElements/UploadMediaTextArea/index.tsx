import type { ChangeEventHandler } from "react";

interface UploadMediaTextAreaProps {
    name: string;
    placeholder: string;
    id: string;
    labelText: string;
    onChange?: ChangeEventHandler<HTMLTextAreaElement>;
    value?: string;
}

export default function UploadMediaTextArea({name, placeholder, id, labelText, onChange, value}: UploadMediaTextAreaProps){
    return (
        <div className="relative w-lg">
            <textarea 
                name={name} 
                placeholder={placeholder}
                id={id}
                className="peer border-gray-300 border rounded-2xl h-18 w-full px-4 pt-7 pb-1 outline-none text-base transition-all resize-none"
                value={value}
                onChange={onChange}
                />
            <label
                htmlFor={name}
                className="absolute left-4 top-2 text-xs font-semibold text-gray-80000 pointer-events-none"
                >
                {labelText}
            </label>
        </div>
    )
}