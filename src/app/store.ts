import { configureStore } from "@reduxjs/toolkit";
// The name uiReducer is completely arbitrary. You could use even banana instead.
import uiReducer from "../features/ui/uiSlice";
import { authApi } from "../features/auth/authApi";
import { pinsApi } from "../features/pins/pinsApi";
import authReducer from "../features/auth/authSlice";
import { usersApi } from "../features/users/userApi";
import { boardsApi } from "../features/boards/boardsApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [pinsApi.reducerPath]: pinsApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [boardsApi.reducerPath]: boardsApi.reducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(
      authApi.middleware, 
      pinsApi.middleware, 
      usersApi.middleware,
      boardsApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
