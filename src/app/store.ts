import { configureStore } from "@reduxjs/toolkit";
// The name uiReducer is completely arbitrary. You could use even banana instead.
import uiReducer from "../features/ui/uiSlice";
import { authApi } from "../features/auth/authApi";
import authReducer from "../features/auth/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
