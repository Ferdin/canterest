import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../app/store";

interface UploadResponse {
    media_url: string;
}

interface PinCreate {
    media_url: string;
    title?: string;
    description?: string;
    link?: string;
    board_id?: number;
    topics?: string[];
    tagged_products?: object[];
    alt_text?: string;
    mark_as_ai_modified?: boolean;
    includes_ai_generated_person?: boolean;
    allow_comments?: boolean;
    show_similar_products?: boolean;
}

interface PinOut extends PinCreate {
    id: number;
    owner_id: number;
}

export const pinsApi = createApi({
    reducerPath: "pinsApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:8000",
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token;
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes:["Pin"],
    endpoints: (builder) => ({
        uploadMedia: builder.mutation<UploadResponse, FormData>({
            query: (formData) => ({
                url: "/uploads/media",
                method: "POST",
                body: formData,
            }),
        }),
        createPin: builder.mutation<PinOut, PinCreate>({
            query: (body) => ({
                url: "/pins",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Pin"]
        }),
        getPins: builder.query<PinOut[], void>({
            query: () => "/pins",
            providesTags: ["Pin"],
        }),
    }),
});

export const { useUploadMediaMutation, useCreatePinMutation, useGetPinsQuery } = pinsApi;