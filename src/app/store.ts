import { configureStore } from "@reduxjs/toolkit";
// The name uiReducer is completely arbitrary. You could use even banana instead.
import uiReducer from "../features/ui/uiSlice";
import { authApi } from "../features/auth/authApi";
import { pinsApi } from "../features/pins/pinsApi";
import authReducer from "../features/auth/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [pinsApi.reducerPath]: pinsApi.reducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(authApi.middleware, pinsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
