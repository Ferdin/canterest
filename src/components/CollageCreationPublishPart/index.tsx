import { ChevronLeft } from "lucide-react";

type CollageCreationPublishPartProps = {
    onBack: () => void;
}

export default function CollageCreationPublishPart(
    { onBack }: CollageCreationPublishPartProps
) {
    return (
        <div>
            <div className="flex flex-row justify-between p-6">
                <div className="flex flex-row items-center cursor-pointer" onClick={onBack}>
                    <ChevronLeft width={36} height={36}/>
                    <span className="px-4 font-bold">Publish to your board</span>
                </div>
                <div className="flex flex-row items-center">
                    <button className="bg-red-500 hover:bg-red-700 cursor-pointer px-4 py-4 text-white">Publish</button>
                </div>
            </div>
            <div className="flex justify-center">
                <div>
                    {/**
                     * Canvas review
                     */}
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col">
                        <span className="text-sm">Title</span>
                        <input type="text" placeholder="Add a title" className="border p-2 rounded-lg mt-2 w-lg"/>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm">Description</span>
                        <textarea placeholder="Add a description" className="border p-2 rounded-lg mt-2 w-lg"/>
                    </div>
                </div>
            </div>
        </div>
    )
}