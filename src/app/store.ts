import { configureStore } from "@reduxjs/toolkit";
// The name uiReducer is completely arbitrary. You could use even banana instead.
import uiReducer from "../features/ui/uiSlice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
