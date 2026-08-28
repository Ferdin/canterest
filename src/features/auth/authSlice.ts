import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from "./types";
import { authApi } from './authApi';
import type { AppDispatch } from '../../app/store';

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

// thunk: clears auth state AND wipes any cached RTK Query data (pins, boards, etc.)
export const logoutAndClearCache = () => (dispatch: AppDispatch) => {
    dispatch(logout());
    dispatch(authApi.util.resetApiState());
};

export default authSlice.reducer;