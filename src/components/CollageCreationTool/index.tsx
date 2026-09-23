import { Ellipsis, Image, LineSquiggle, Redo2, Type, Undo2, X } from "lucide-react";
import Canvas from "../CollegeCreationComponents/Canvas";
import CanvasComponents from "../CollegeCreationComponents/CanvasComponents";

export default function CollageCreationTool(){
    return(
        <div className="flex flex-row">
            <div className="w-[60%] border-r h-screen">
                <div className="flex flex-row justify-between px-2">
                    <div className="flex flex-row items-center justify-center gap-4">
                        <X className="w-12 h-12"/>
                        <span className="text-lg font-bold">Create Collage</span>
                    </div>
                    <div className="flex flex-row items-center gap-4">
                        <Undo2/>
                        <Redo2/>
                        <Ellipsis/>
                        <button className="bg-red-600 px-4 py-4 rounded-xl text-white font-medium">Next</button>
                    </div>
                </div>
                <div className="flex flex-row mt-4">
                    <div className="w-[40%]">
                        <div className="w-full px-2">
                            <span className="font-semibold">Cutouts</span>
                            <p className="mt-2">Select a cutout to edit or drag to reorder</p>
                        </div>
                    </div>
                    <div className="w-[60%] flex flex-col">
                        <div className="w-full flex justify-center">
                            <Canvas/>
                        </div>
                        <div className="flex flex-row gap-4 justify-center mt-2">
                            <Type className="cursor-pointer hover:bg-olive-300 p-2 rounded-lg" width={48} height={48}/>
                            <LineSquiggle className="cursor-pointer hover:bg-olive-300 p-2 rounded-lg" width={48} height={48}/>
                            <Image className="cursor-pointer hover:bg-olive-300 p-2 rounded-lg" width={48} height={48}/>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-[40%]">
                <CanvasComponents/>
            </div>
        </div>
    )
}