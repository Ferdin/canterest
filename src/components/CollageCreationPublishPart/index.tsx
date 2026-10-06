import { ChevronDown, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useAppSelector } from "../../app/hooks";

type CollageCreationPublishPartProps = {
    onBack: () => void;
}

export default function CollageCreationPublishPart(
    { onBack }: CollageCreationPublishPartProps
) {
    const [toggle, setToggle] = useState<boolean>(false);

    const toggleDropdown = () => {
        setToggle((state) => !state);    
    }

    const exportedImage = useAppSelector((state) => state.canvas.exportedImage);

    return (
        <div>
            <div className="flex flex-row justify-between p-6">
                <div className="flex flex-row items-center cursor-pointer" onClick={onBack}>
                    <ChevronLeft width={36} height={36}/>
                    <span className="px-4 font-bold">Publish to your board</span>
                </div>
                <div className="flex flex-row items-center">
                    <button className="bg-red-500 hover:bg-red-700 cursor-pointer px-4 py-4 text-white rounded-2xl">Publish</button>
                </div>
            </div>
            <div className="flex justify-center">
                <div className="mr-10 w-80 shrink-0">
                    {exportedImage ? (
                        <img
                            src={exportedImage}
                            alt="Collage preview"
                            className="w-full rounded-2xl shadow-md"
                        />
                    ) : (
                        <div className="aspect-2/3 w-full animate-pulse rounded-2xl bg-gray-200" />
                    )}
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col">
                        <span className="text-sm text-olive-600">Title</span>
                        <input type="text" placeholder="Add a title" className="border border-olive-300 p-2 rounded-lg mt-2 w-lg"/>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-olive-600">Description</span>
                        <textarea placeholder="Add a description" className="border border-olive-300 p-2 rounded-lg mt-2 w-lg"/>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-olive-600">Board</span>
                        <div className="border p-2 rounded-lg mt-2 w-lg h-10 flex justify-between cursor-pointer border-olive-300" onClick={toggleDropdown}>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-amber-500 rounded"></div>
                                Profile
                            </div>
                            <ChevronDown/>
                        </div>
                        {toggle && (<div className="absolute w-lg h-54 rounded-md shadow bg-white mt-20 z-10">

                        </div>)}
                    </div>
                    <div className="flex flex-row items-center">
                        <div className="flex flex-col w-full p-2">
                            <span className="font-semibold text-olive-700">Enable remixing</span>
                            <span className="text-sm text-olive-600">Let others create their own collage from yours.</span>
                        </div>
                        <div className="flex justify-end w-full">
                            <label className="relative inline-block w-15 h-8.5">
                                <input 
                                    type="checkbox" 
                                    className="peer opacity-0 w-0 h-0"
                                />
                                <span className={`absolute cursor-pointer inset-0 bg-gray-300 transition-all duration-400 rounded-full
                                            peer-checked:bg-blue-500
                                            peer-focus:shadow-[0_0_1px_#2196F3]
                                            before:content-[''] before:absolute before:h-6.5 before:w-6.5 before:left-1 before:bottom-1
                                            before:bg-white before:transition-all before:duration-400 before:rounded-full
                                            peer-checked:before:translate-x-6.5`}>
                                </span>
                            </label>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-olive-600">Alt Text</span>
                        <textarea placeholder="Add Alt Text" className="border border-olive-300 p-2 rounded-lg mt-2 w-lg"/>
                        <span className="text-xs mt-2 text-olive-600">This helps people using screen readers</span>
                    </div>
                </div>
            </div>
        </div>
    )
}