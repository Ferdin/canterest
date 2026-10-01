import { Ellipsis, Image, LineSquiggle, Redo2, Type, Undo2, X } from "lucide-react";
import Canvas from "../CollageCreationComponents/Canvas";
import CanvasComponents from "../CollageCreationComponents/CanvasComponents";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { triggerUndo, triggerRedo, type Tool, setActiveTool } from "../../features/canvas/canvasSlice";
import LayersPanel from "../CollageCreationComponents/LayersPanel";
import TypeComponents from "../CollageCreationComponents/TypeComponents";
import { useState } from "react";
import CollageCreationPublishPart from "../CollageCreationPublishPart";

export default function CollageCreationTool(){

    const dispatch = useAppDispatch();
    const canUndo = useAppSelector((state) => state.canvas.canUndo);
    const canRedo = useAppSelector((state) => state.canvas.canRedo);

    const [step, setStep] = useState<"create" | "publish">("create");

    const TOOLS: {id: Tool, label: string, Icon: typeof Type}[] = [
        { id: "text", label: "text", Icon: Type },
        { id: "draw", label: "Draw", Icon: LineSquiggle },
        { id: "image", label: "Image", Icon: Image },
    ];

    const activeTool = useAppSelector((state) => state.canvas.activeTool);

    return(
        <>
            <div className={`flex flex-row ${step === "create" ? "contents" : "hidden"}`}>
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
                            <button 
                                className="bg-red-600 px-4 py-4 rounded-xl text-white font-medium cursor-pointer hover:bg-red-700"
                                onClick={() => setStep("publish")}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-row mt-4">
                        <div className="w-[30%]">
                            <div className="w-full px-6 flex flex-col gap-1">
                                <span className="font-semibold">Cutouts</span>
                                <p className="">Select a cutout to edit or drag to reorder</p>
                                <LayersPanel/>
                            </div>
                        </div>
                        <div className="w-[70%] flex flex-col">
                            <div className="w-full flex justify-center">
                                <Canvas/>
                            </div>
                            <div
                                className="flex flex-row gap-4 justify-center mt-2"
                                role="toolbar"
                                aria-label="Collage tools"
                            >
                                {TOOLS.map(({ id, label, Icon }) => (
                                    <button
                                        key={id}
                                        type="button"
                                        title={label}
                                        aria-label={label}
                                        aria-pressed={activeTool === id}
                                        onClick={() => dispatch(setActiveTool(id))}
                                        className={`cursor-pointer p-2 rounded-lg ${
                                            activeTool === id ? "bg-olive-300" : "hover:bg-olive-300"
                                        }`}
                                    >
                                        <Icon width={32} height={32} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-[40%] px-6 mt-4">
                    {activeTool === "draw" && <CanvasComponents />}
                    {activeTool === "text" && <TypeComponents />}
                </div>
            </div>
            {step === "publish" && (
                <CollageCreationPublishPart onBack={() => setStep("create")}/>
            )}
        </>
    )
}