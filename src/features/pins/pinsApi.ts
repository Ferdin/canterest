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

export interface PinOut extends PinCreate {
    id: number;
    owner_id: number;
    created_at: string;
    days_until_expiration: number | null;
}

export type PinUser = {
    id: number;
    username: string;
    avatar_url: string | null;
}

export type PinDetail = Omit<PinOut, "description"> & {
    description: string | null;
    creator: PinUser;
    like_count: number;
    liked_by_me: boolean;
}

export type CommentOut = {
    id: number;
    body: string;
    created_at: string;
    author: PinUser;
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
    tagTypes:["Pin", "PinDetail", "Comment"],
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
        getPinsByUsername: builder.query<PinOut[], string> ({
            query: (username) => `/pins?username=${username}`,
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
        getPinDetail: builder.query<PinDetail, PinOut["id"]>({
            query: (pinId) => `/pins/${pinId}`,
            providesTags: (_result, _error, pinId) => [{ type: "PinDetail", id: pinId }],
        }),
        getPinComments: builder.query<CommentOut[], PinOut["id"]>({
            query: (pinId) => `/pins/${pinId}/comments`,
            providesTags: (_result, _error, pinId) => [{ type: "Comment", id: pinId }],
        }),

        addComment: builder.mutation<CommentOut, { pinId: PinOut["id"]; body: string }>({
            query: ({ pinId, body }) => ({
                url: `/pins/${pinId}/comments`,
                method: "POST",
                body: { body },
            }),
            invalidatesTags: (_result, _error, { pinId }) => [{ type: "Comment", id: pinId }],
        }),

        toggleLike: builder.mutation<void, { pinId: PinOut["id"]; liked: boolean }>({
            // liked = the current state, so a liked pin gets unliked.
            query: ({ pinId, liked }) => ({
                url: `/pins/${pinId}/like`,
                method: liked ? "DELETE" : "POST",
            }),
            // Update the heart and count immediately; roll back if the request fails.
            async onQueryStarted({ pinId, liked }, { dispatch, queryFulfilled }) {
                const patch = dispatch(
                    pinsApi.util.updateQueryData("getPinDetail", pinId, (draft) => {
                        draft.liked_by_me = !liked;
                        draft.like_count += liked ? -1 : 1;
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patch.undo();
                }
            },
        }),
    }),
});

export const {
    useUploadMediaMutation,
    useCreatePinMutation,
    useUpdatePinMutation,
    useGetPinsQuery,
    useGetMyDraftsQuery,
    useGetPinsByUsernameQuery,
    useGetPinDetailQuery,
    useGetPinCommentsQuery,
    useAddCommentMutation,
    useToggleLikeMutation,
} = pinsApi;