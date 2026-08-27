import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from "./types";

interface AuthState {
    token: string | null;
    user: User | null;
}

const initialState: AuthState = {
    token: localStorage.getItem("token"),
    user: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ token: string}>) => {
            state.token = action.payload.token;
            localStorage.setItem("token", action.payload.token);
        },
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
        },
        logout: (state) => {
            state.token = null;
            state.user = null;
            localStorage.removeItem("token");
        }
    }
})

export const { setCredentials, setUser, logout } = authSlice.actions;
export default authSlice.reducer;