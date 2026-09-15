import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { PublicUser } from "./types";

export const usersApi = createApi({
    reducerPath: "usersApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:8000",
        // no prepareHeaders needed — this endpoint is public, no auth required
    }),
    endpoints: (builder) => ({
        getUserByUsername: builder.query<PublicUser, string>({
            query: (username) => `/users/${username}`,
        }),
    }),
});

export const { useGetUserByUsernameQuery } = usersApi;
