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
  isCreateBoardOpen: boolean;
}

const initialState: UIState = {
  activeMenu: null,
  isCreateBoardOpen: false,
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
    openCreateBoardModal: (state) => {
      state.isCreateBoardOpen = true;
    },
    closeCreateBoardModal: (state) => {
      state.isCreateBoardOpen = false;
    }
  },
});

export const { setActiveMenu, closeMenu, openCreateBoardModal, closeCreateBoardModal } = uiSlice.actions;

export default uiSlice.reducer;
