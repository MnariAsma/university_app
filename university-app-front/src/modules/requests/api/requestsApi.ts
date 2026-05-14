import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../../constants/api";
import type { RootState } from "../../../store/store";

export interface DocumentRequest {
  id: string;
  category: "INTERNSHIP" | "UNIVERSITY";
  type: "INTERNSHIP_DOC" | "CERTIFICATE_SUCCESS" | "CERTIFICATE_ATTENDANCE";
  academicYearId?: string;
  reason?: string;
  studentFileUrl?: string;
  adminFileUrl?: string;
  status: "PENDING" | "ACCEPTED" | "REFUSED";
  createdAt: string;
  academicYear?: { id: string; label: string; active: boolean };
}

export interface AcademicYear {
  id: string;
  label: string;
  active: boolean;
}

export const requestsApi = createApi({
  reducerPath: "requestsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Requests"],
  endpoints: (builder) => ({
    getMyRequests: builder.query<DocumentRequest[], void>({
      query: () => "/requests/my-requests",
      providesTags: ["Requests"],
    }),
    createRequest: builder.mutation<DocumentRequest, FormData>({
      query: (formData) => ({
        url: "/requests",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Requests"],
    }),
    getAcademicYears: builder.query<AcademicYear[], void>({
      query: () => "/academic-years",
    }),
    deleteRequest: builder.mutation<void, string>({
      query: (id) => ({
        url: `/requests/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Requests"],
    }),
  }),
});

export const {
  useGetMyRequestsQuery,
  useCreateRequestMutation,
  useGetAcademicYearsQuery,
  useDeleteRequestMutation,
} = requestsApi;
