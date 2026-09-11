import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../app/store";

interface UploadResponse {
    media_url: string;
}

interface PinCreate {
    media_url: string;
    status?: "draft" | "published";
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
    created_at: string;
    days_until_expiration: number | null;
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
        // add PATCH mutation + a way to query drafts
        updatePin: builder.mutation<PinOut, { id: number; updates: Partial<PinCreate> }>({
            query: ({ id, updates }) => ({
                url: `/pins/${id}`,
                method: "PATCH",
                body: updates,
            }),
            invalidatesTags: ["Pin"],
        }),
        getMyDrafts: builder.query<PinOut[], void>({
            query: () => "/pins?mine=true&status=draft",
            providesTags: ["Pin"],
        }),
    }),
});

export const { 
    useUploadMediaMutation, 
    useCreatePinMutation,
    useUpdatePinMutation, 
    useGetPinsQuery,
    useGetMyDraftsQuery
} = pinsApi;