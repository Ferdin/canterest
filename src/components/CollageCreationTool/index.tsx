import { Ellipsis, Image, LineSquiggle, Redo2, Type, Undo2, X } from "lucide-react";
import Canvas from "../CollageCreationComponents/Canvas";
import CanvasComponents from "../CollageCreationComponents/CanvasComponents";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { triggerUndo, triggerRedo, setActiveLayer } from "../../features/canvas/canvasSlice";

export default function CollageCreationTool(){

    const canUndo = useAppSelector((state) => state.canvas.canUndo);
    const canRedo = useAppSelector((state) => state.canvas.canRedo);

    const dispatch = useAppDispatch();
    const layers = useAppSelector((state) => state.canvas.layers);
    const activeLayerId = useAppSelector((state) => state.canvas.activeLayerId);

    return(
        <div className="flex flex-row">
            <div className="w-[60%] border-r border-r-olive-300 h-screen">
                <div className="flex flex-row justify-between px-4 mt-4">
                    <div className="flex flex-row items-center justify-center gap-4">
                        <X className="w-12 h-12"/>
                        <span className="text-lg font-bold">Create Collage</span>
                    </div>
                    <div className="flex flex-row items-center gap-4">
                        <button
                            type="button"
                            disabled={!canUndo}
                            className="rounded-full p-2 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                            <Undo2 onClick={() => dispatch(triggerUndo())}/>
                        </button>
                        <button
                            type="button"
                            disabled={!canRedo}
                            className="rounded-full p-2 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                            <Redo2 onClick={() => dispatch(triggerRedo())}/>
                        </button>
                        <Ellipsis/>
                        <button className="bg-red-600 px-4 py-4 rounded-xl text-white font-medium cursor-pointer hover:bg-red-700">Next</button>
                    </div>
                </div>
                <div className="flex flex-row mt-4">
                    <div className="w-[30%]">
                        <div className="w-full px-6 flex flex-col gap-1">
                            <span className="font-semibold">Cutouts</span>
                            <p className="">Select a cutout to edit or drag to reorder</p>
                            <div className="w-58 h-[calc(100vh-200px)] rounded-xl mt-1 overflow-scroll" data-drawing-tools>
                                {layers.length === 0 ? (
                                    <p className="p-4 text-sm text-gray-500">Start drawing to create a layer.</p>
                                ) : (
                                    <ul className="flex flex-col gap-2 p-2">
                                        {[...layers].reverse().map((layer) => {
                                            const isActive = layer.id === activeLayerId;
                                            return (
                                                <li key={layer.id}>
                                                    <button
                                                        type="button"
                                                        aria-pressed={isActive}
                                                        onClick={() => dispatch(setActiveLayer(layer.id))}
                                                        className={`flex w-full items-center gap-3 rounded-lg p-2 text-left ${
                                                            isActive ? "bg-gray-200" : "hover:bg-gray-100"
                                                        }`}
                                                    >
                                                        {layer.thumbnail && (
                                                            <img
                                                                src={layer.thumbnail}
                                                                alt=""
                                                                className="h-16 w-12 rounded-md border border-gray-200 bg-white object-contain"
                                                            />
                                                        )}
                                                        <span className="text-sm font-medium">{layer.name}</span>
                                                    </button>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="w-[70%] flex flex-col">
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
            <div className="w-[40%] px-6 mt-4">
                <CanvasComponents/>
            </div>
        </div>
    )
}