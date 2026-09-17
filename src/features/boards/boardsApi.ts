import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Board, BoardCreate } from "./types";
import type { RootState } from "../../app/store";

export const boardsApi = createApi({
    reducerPath: "boardsApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:8000",
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token;
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["Board"],
    endpoints: (builder) => ({
        createBoard: builder.mutation<Board, BoardCreate>({
            query: (body) => ({
                url: "/boards",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Board"],
        }),
        getMyBoards: builder.query<Board[], void>({
            query: () => "/boards?mine=true",
            providesTags: ["Board"]
        }),
    }),
});

export const { useCreateBoardMutation, useGetMyBoardsQuery } = boardsApi;