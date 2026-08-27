import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
    RegisterRequest,
    LoginRequest,
    GoogleLoginRequest,
    TokenResponse,
    MeResponse,
} from "./types";

import type { RootState } from "../../app/store";

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:8000",
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token;
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;    
        },
    }),
    endpoints: (builder) => ({
        register: builder.mutation<TokenResponse, RegisterRequest>({
            query: (body) => ({
                url: "/auth/register",
                method: "POST",
                body,
            })
        }),
        login: builder.mutation<TokenResponse, LoginRequest>({
            query: (body) => ({
                url: "/auth/login",
                method: "POST",
                body,
            })
        }),
        googleLogin: builder.mutation<TokenResponse, GoogleLoginRequest> ({
            query: (body) => ({
                url: "/auth/google",
                method: "POST",
                body,
            })
        }),
        getMe: builder.query<MeResponse, void>({
            query: () => "/auth/me",
        })
    })
})

export const {
    useRegisterMutation,
    useLoginMutation,
    useGoogleLoginMutation,
    useGetMeQuery,
} = authApi;