import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type BrushStyle = "pencil" | "eraser" | "glow" | "spray" | "crayon";

interface CanvasState {
    color: string;
    brushSize: number;
    clearTrigger: number; // incremented to signal "clear now" — Canvas.tsx watches this
    brushStyle: BrushStyle;
    opacity: number;
}

const initialState: CanvasState = {
    color: "#000000",
    brushSize: 5,
    clearTrigger: 0,
    brushStyle: "pencil",
    opacity: 1
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
        }
    },
});

export const { setColor, setBrushSize, triggerClear, setBrushStyle, setOpacity } = canvasSlice.actions;
export default canvasSlice.reducer;