import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type ActiveMenu =
  | "createBoard"
  | "notification"
  | "message"
  | "settings"
  | null;

interface UIState {
  activeMenu: ActiveMenu;
}

const initialState: UIState = {
  activeMenu: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setActiveMenu: (state, action: PayloadAction<ActiveMenu>) => {
      state.activeMenu = action.payload;
    },

    closeMenu: (state) => {
      state.activeMenu = null;
    },
  },
});

export const { setActiveMenu, closeMenu } = uiSlice.actions;

export default uiSlice.reducer;
