import { Images } from "lucide-react";

export default function PinCreationTool(){
    return (<div className="px-56 pt-10 flex flex-row gap-8">
        <div>
            <div className="relative w-96 h-96 bg-olive-300 flex border rounded-2xl py-10 cursor-pointer">
                <div className="flex flex-col items-center justify-center w-full h-full pb-12">
                    <Images/>
                    <span className="font-semibold mt-2">Upload your media</span>
                    <p className="text-center text-sm text-gray-500 pt-2">Select multiple files in your file<br/>picker with Shift or Cmd/Ctrl.</p>
                    <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-sm text-gray-500 w-full px-4">JPG, PNG up to 20MB · MP4 up to 200MB</p>
                </div>
            </div>
            <hr className="border-olive-300 my-6  w-96" />
            <div className="w-96 h-12 bg-olive-300 flex border rounded-2xl cursor-pointer hover:bg-olive-400">
                <div className="flex items-center justify-center w-full h-full text-sm font-semibold">
                    Save from URL
                </div>
            </div>
        </div>
        <div className="relative w-lg">
            <input 
                type="text" 
                name="text" 
                placeholder="Tell everyone what your Pin is about"
                id="text-input"
                className="peer border-gray-300 border rounded-2xl h-18 w-full px-4 pt-5 pb-1 outline-none text-base transition-all"
            />
            <label
                htmlFor="text-input"
                className="absolute left-4 top-2 text-xs font-semibold text-gray-80000 pointer-events-none"
            >
                Title
            </label>
        </div>
    </div>);
}