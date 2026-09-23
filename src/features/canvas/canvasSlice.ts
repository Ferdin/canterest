import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface CanvasState {
    color: string;
    brushSize: number;
    clearTrigger: number; // incremented to signal "clear now" — Canvas.tsx watches this
}

const initialState: CanvasState = {
    color: "#000000",
    brushSize: 5,
    clearTrigger: 0,
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
    },
});

export const { setColor, setBrushSize, triggerClear } = canvasSlice.actions;
export default canvasSlice.reducer;