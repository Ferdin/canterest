import type { ChangeEventHandler } from "react";

interface UploadMediaTextInputProps {
    name: string;
    placeholder: string;
    id: string;
    labelText: string;
    onChange?: ChangeEventHandler<HTMLInputElement>;
    value?: string;
}

export default function UploadMediaTextInput({name, placeholder, id, labelText, onChange, value}: UploadMediaTextInputProps) {
    return(
        <div className="relative w-lg">
                <input 
                    type="text" 
                    name={name} 
                    placeholder={placeholder}
                    id={id}
                    value={value}
                    className="peer border-gray-300 border rounded-2xl h-18 w-full px-4 pt-5 pb-1 outline-none text-base transition-all"
                    onChange={onChange}
                    />
                <label
                    htmlFor={id}
                    className="absolute left-4 top-2 text-xs font-semibold text-gray-80000 pointer-events-none"
                    >
                    {labelText}
                </label>
        </div>
    )
}