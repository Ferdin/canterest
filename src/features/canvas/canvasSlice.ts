import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type BrushStyle = "pencil" | "eraser" | "glow" | "spray" | "crayon";

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
}

export type LayerInfo = {
    id: number;
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
    requestLayerOrder
} = canvasSlice.actions;
export default canvasSlice.reducer;