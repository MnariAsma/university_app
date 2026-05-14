import { createApi } from "@reduxjs/toolkit/query/react";
import { BaseQuery } from "../../../baseQuery/BaseQuery";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "ALERT" | "REMINDER" | "GRADE" | "ABSENCE" | "COURSE" | "EXAM";
  read: boolean;
  redirectLink?: string;
  createdAt: string;
}

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: BaseQuery,
  tagTypes: ["Notifications"],
  endpoints: (builder) => ({
    getNotifications: builder.query<Notification[], void>({
      query: () => "/notifications/my",
      providesTags: ["Notifications"],
    }),
    markAsRead: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),
    markAllAsRead: builder.mutation<void, void>({
      query: () => ({
        url: `/notifications/read-all`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationApi;
