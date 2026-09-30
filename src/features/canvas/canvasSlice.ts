import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type BrushStyle = "pencil" | "eraser" | "glow" | "spray" | "crayon";

export type Tool = "draw" | "text" | "image";

export type  TextAlign = "left" | "center" | "right";

export type TextStyle = {
    fontFamily: string;
    fontSize: number;
    color: string;
    align: TextAlign;
}

export const TEXT_FONTS = [
    { label: "Arial", value: "Arial, Helvetica, sans-serif" },
    { label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
    { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
    { label: "Courier New", value: "'Courier New', Courier, monospace" },
    { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
    { label: "Trebuchet MS", value: "'Trebuchet MS', Helvetica, sans-serif" },
    { label: "Impact", value: "Impact, 'Arial Black', sans-serif" },
    { label: "Comic Sans MS", value: "'Comic Sans MS', 'Comic Sans', cursive" },
];

interface CanvasState {
    color: string;
    brushSize: number;
    clearTrigger: number; // incremented to signal "clear now" — Canvas.tsx watches this
    brushStyle: BrushStyle;
    opacity: number;
    undoTrigger: number;
    redoTrigger: number;
    canUndo: boolean;
    canRedo: boolean;
    layers: LayerInfo[];
    activeLayerId: number | null;
    backgroundColor: string;
    layerOrderRequest: { order: number[]; nonce: number } | null;
    activeTool: Tool | null;
    textStyle: TextStyle;
    addTextTrigger: number;
}

export type LayerInfo = {
    id: number;
    kind: "draw" | "text";
    name: string;
    thumbnail: string;
}


const initialState: CanvasState = {
    color: "#000000",
    brushSize: 5,
    clearTrigger: 0,
    brushStyle: "pencil",
    opacity: 1,
    undoTrigger: 0,
    redoTrigger: 0,
    canUndo: false,
    canRedo: false,
    layers: [],
    activeLayerId: null,
    backgroundColor: "#ffffff",
    layerOrderRequest: null,
    activeTool: "draw",
    textStyle: {
        fontFamily: TEXT_FONTS[0].value,
        fontSize: 32,
        color: "#111111",
        align: "center",
    },
    addTextTrigger: 0,
}

const canvasSlice = createSlice({
    name: "canvas",
    initialState,
    reducers: {
        setColor: (state, action: PayloadAction<string>) => {
            state.color = action.payload;
        },
        setBrushSize: (state, action: PayloadAction<number>) => {
            state.brushSize = action.payload;
        },
        triggerClear: (state) => {
            state.clearTrigger += 1;
        },
        setBrushStyle: (state, action: PayloadAction<BrushStyle>) => {
            state.brushStyle = action.payload;
        },
        setOpacity: (state, action: PayloadAction<number>) => {
            state.opacity = action.payload;
        },
        triggerUndo(state) {
            state.undoTrigger += 1;
        },
        triggerRedo(state) {
            state.redoTrigger += 1;
        },
        setHistoryState(state, action: PayloadAction<{ canUndo: boolean; canRedo: boolean }>) {
            state.canUndo = action.payload.canUndo;
            state.canRedo = action.payload.canRedo;
        },
        setLayers(state, action: PayloadAction<LayerInfo[]>) {
            state.layers = action.payload;
        },
        setActiveLayer(state, action: PayloadAction<number | null>) {
            state.activeLayerId = action.payload;
        },
        setBackgroundColor(state, action: PayloadAction<string>) {
            state.backgroundColor = action.payload;
        },
        setActiveTool(state, action: PayloadAction<Tool | null>) {
            state.activeTool = action.payload;
        },
        setTextStyle(state, action: PayloadAction<Partial<TextStyle>>) {
            state.textStyle = { ...state.textStyle, ...action.payload };
        },
        triggerAddText(state) {
            state.addTextTrigger += 1;
        },
        requestLayerOrder(state, action: PayloadAction<number[]>) {
            // Reorder the panel list right away so it doesn't snap back while Canvas applies it.
            const byId = new Map(state.layers.map((layer) => [layer.id, layer]));
            state.layers = action.payload.flatMap((id) => {
                const layer = byId.get(id);
                return layer ? [layer] : [];
            });
            state.layerOrderRequest = {
                order: action.payload,
                nonce: (state.layerOrderRequest?.nonce ?? 0) + 1,
            };
        }
    },
});

export const { 
    setColor,
    setBrushSize,
    triggerClear,
    setBrushStyle,
    setOpacity, 
    triggerRedo, 
    triggerUndo, 
    setHistoryState, 
    setLayers, 
    setActiveLayer,
    setBackgroundColor,
    requestLayerOrder,
    setActiveTool,
    setTextStyle,
    triggerAddText,
} = canvasSlice.actions;
export default canvasSlice.reducer;