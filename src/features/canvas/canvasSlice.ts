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
        }
    },
});

export const { setColor, setBrushSize, triggerClear, setBrushStyle, setOpacity, triggerRedo, triggerUndo, setHistoryState } = canvasSlice.actions;
export default canvasSlice.reducer;