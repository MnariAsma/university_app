import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../../constants/api";
import type { RootState } from "../../../store/store";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  targetProgramId?: string;
  targetLevelId?: string;
  createdAt: string;
  program?: { name: string };
  level?: { name: string };
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  type: string;
  targetProgramId?: string;
  targetLevelId?: string;
}

export const announcementApi = createApi({
  reducerPath: "announcementApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Announcements"],
  endpoints: (builder) => ({
    getAnnouncements: builder.query<Announcement[], void>({
      query: () => "/announcements",
      providesTags: ["Announcements"],
    }),
    createAnnouncement: builder.mutation<Announcement, CreateAnnouncementRequest>({
      query: (body) => ({
        url: "/announcements",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Announcements"],
    }),
  }),
});

export const { useGetAnnouncementsQuery, useCreateAnnouncementMutation } = announcementApi;
