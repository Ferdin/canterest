import { Images } from "lucide-react";

export default function PinCreationTool(){
    return (<div className="px-56 pt-10 flex flex-row gap-8 mb-4">
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
        <div className="flex flex-col gap-6">
            <div className="relative w-lg">
                <input 
                    type="text" 
                    name="can_pin_title" 
                    placeholder="Tell everyone what your Pin is about"
                    id="can_pin_title"
                    className="peer border-gray-300 border rounded-2xl h-18 w-full px-4 pt-5 pb-1 outline-none text-base transition-all"
                    />
                <label
                    htmlFor="can_pin_title"
                    className="absolute left-4 top-2 text-xs font-semibold text-gray-80000 pointer-events-none"
                    >
                    Title
                </label>
            </div>
            <div className="relative w-lg">
                <textarea 
                    name="can_pin_desc" 
                    placeholder="Describe your Pin"
                    id="can_pin_desc"
                    className="peer border-gray-300 border rounded-2xl h-18 w-full px-4 pt-7 pb-1 outline-none text-base transition-all resize-none"
                    />
                <label
                    htmlFor="can_pin_desc"
                    className="absolute left-4 top-2 text-xs font-semibold text-gray-80000 pointer-events-none"
                    >
                    Description
                </label>
            </div>
            <div className="relative w-lg">
                <input 
                    type="text" 
                    name="can_pin_link" 
                    placeholder="Add a Link"
                    id="can_pin_link"
                    className="peer border-gray-300 border rounded-2xl h-18 w-full px-4 pt-5 pb-1 outline-none text-base transition-all"
                    />
                <label
                    htmlFor="can_pin_link"
                    className="absolute left-4 top-2 text-xs font-semibold text-gray-80000 pointer-events-none"
                    >
                    Link
                </label>
            </div>
            <div className="relative w-lg">
                <input 
                    type="text" 
                    name="can_pin_board" 
                    placeholder="Search for a board."
                    id="can_pin_board"
                    className="peer border-gray-300 border rounded-2xl h-18 w-full px-4 pt-5 pb-1 outline-none text-base transition-all"
                    />
                <label
                    htmlFor="can_pin_board"
                    className="absolute left-4 top-2 text-xs font-semibold text-gray-80000 pointer-events-none"
                    >
                    Board
                </label>
            </div>
            <div className="relative w-lg">
                <input 
                    type="text" 
                    name="can_pin_tag" 
                    placeholder="Search for a tag"
                    id="can_pin_tag"
                    className="peer border-gray-300 border rounded-2xl h-18 w-full px-4 pt-5 pb-1 outline-none text-base transition-all"
                    />
                <label
                    htmlFor="can_pin_tag"
                    className="absolute left-4 top-2 text-xs font-semibold text-gray-80000 pointer-events-none"
                    >
                    Tagged Topics
                </label>
            </div>
            <div className="flex flex-col">
                <span className="text-xs font-semibold">Tag Products</span>
                <button className="text-sm font-semibold bg-olive-200 py-1 w-48 rounded-lg mt-2">Add Products</button>
            </div>
            <div className="flex flex-row gap-2">
                <div>
                    <label className="relative inline-block w-15 h-8.5">
                        <input type="checkbox" className="peer opacity-0 w-0 h-0" />
                        <span className="absolute cursor-pointer inset-0 bg-gray-300 transition-all duration-400 rounded-full
                                    peer-checked:bg-blue-500
                                    peer-focus:shadow-[0_0_1px_#2196F3]
                                    before:content-[''] before:absolute before:h-6.5 before:w-6.5 before:left-1 before:bottom-1
                                    before:bg-white before:transition-all before:duration-400 before:rounded-full
                                    peer-checked:before:translate-x-6.5">
                        </span>
                    </label>
                </div>
                <div className="flex flex-col gap-2">
                    <h3 className="font-semibold mt-1">Mark as AI-Modified</h3>
                    <span className="text-sm text-olive-500">Content that was made completely or partly with AI</span>
                    <div className="flex gap-2">
                        <input type="checkbox"/>
                        <span className="text-sm">This Pin includes an AI-generated person</span>
                    </div>
                </div>
            </div>
            <div className="flex flex-row gap-2">
                <div>
                    <label className="relative inline-block w-15 h-8.5">
                        <input type="checkbox" className="peer opacity-0 w-0 h-0" />
                        <span className="absolute cursor-pointer inset-0 bg-gray-300 transition-all duration-400 rounded-full
                                    peer-checked:bg-blue-500
                                    peer-focus:shadow-[0_0_1px_#2196F3]
                                    before:content-[''] before:absolute before:h-6.5 before:w-6.5 before:left-1 before:bottom-1
                                    before:bg-white before:transition-all before:duration-400 before:rounded-full
                                    peer-checked:before:translate-x-6.5">
                        </span>
                    </label>
                </div>
                <div className="flex flex-col gap-2">
                    <h3 className="font-semibold mt-1">Allow people to comment</h3>
                </div>
            </div>
            <div className="flex flex-row gap-2 w-lg">
                <div>
                    <label className="relative inline-block w-15 h-8.5">
                        <input type="checkbox" className="peer opacity-0 w-0 h-0" />
                        <span className="absolute cursor-pointer inset-0 bg-gray-300 transition-all duration-400 rounded-full
                                    peer-checked:bg-blue-500
                                    peer-focus:shadow-[0_0_1px_#2196F3]
                                    before:content-[''] before:absolute before:h-6.5 before:w-6.5 before:left-1 before:bottom-1
                                    before:bg-white before:transition-all before:duration-400 before:rounded-full
                                    peer-checked:before:translate-x-6.5">
                        </span>
                    </label>
                </div>
                <div className="flex flex-col gap-2">
                    <h3 className="font-semibold mt-1">Show similar products</h3>
                    <p className="text-sm text-olive-500">People can shop products similar to what's shown in this Pin using visual search
                    Shopping recommendations aren't available for Idea ads and Pins with tagged products or paid partnership label</p>
                </div>
            </div>
            <div className="relative w-lg">
                <textarea 
                    name="can_pin_alt_desc" 
                    placeholder="Describe your Pin's visual details"
                    id="can_pin_alt_desc"
                    className="peer border-gray-300 border rounded-2xl h-18 w-full px-4 pt-7 pb-1 outline-none text-base transition-all resize-none"
                    />
                <label
                    htmlFor="can_pin_alt_desc"
                    className="absolute left-4 top-2 text-xs font-semibold text-gray-80000 pointer-events-none"
                    >
                    Alt Text
                </label>
                <p className="text-xs w-full text-center">This helps people using screen readers understand what your Pin is about</p>
            </div>
        </div>
    </div>);
}