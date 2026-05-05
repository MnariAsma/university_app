import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../../constants/api";

export const courseApi = createApi({
  reducerPath: "courseApi",
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
  tagTypes: ["Courses"],
  endpoints: (builder) => ({
    getTeacherCourses: builder.query<any[], void>({
      query: () => "/courses/teacher",
      providesTags: ["Courses"],
    }),
    getStudentCourses: builder.query<any[], void>({
      query: () => "/courses/student",
      providesTags: ["Courses"],
    }),
    addCourse: builder.mutation<any, FormData>({
      query: (payload) => ({
        url: "/courses",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Courses"],
    }),
    deleteCourse: builder.mutation<void, string>({
      query: (id) => ({
        url: `/courses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Courses"],
    }),
  }),
});

export const {
  useGetTeacherCoursesQuery,
  useGetStudentCoursesQuery,
  useAddCourseMutation,
  useDeleteCourseMutation,
} = courseApi;
