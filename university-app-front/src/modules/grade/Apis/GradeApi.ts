import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../../constants/api";
import type { RootState } from "../../../store/store";

export const gradeApi = createApi({
  reducerPath: "gradeApi",
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
  tagTypes: ["Grades", "Subjects", "Placements", "Students"],
  endpoints: (builder) => ({
    getTeacherSubjects: builder.query<any[], void>({
      query: () => "/grades/subjects",
      providesTags: ["Subjects"],
    }),

    getPlacements: builder.query<any[], string>({
      query: (subjectId) => `/grades/placements?subjectId=${subjectId}`,
      providesTags: ["Placements"],
    }),

    getStudents: builder.query<any[], { programId: string; levelId: string; subjectId?: string; evaluationType?: string; semester?: number }>({
      query: ({ programId, levelId, subjectId, evaluationType, semester }) => {
        let url = `/grades/students?programId=${programId}&levelId=${levelId}`;
        if (subjectId) url += `&subjectId=${subjectId}`;
        if (evaluationType) url += `&evaluationType=${evaluationType}`;
        if (semester) url += `&semester=${semester}`;
        return url;
      },
      providesTags: ["Students"],
    }),

    saveGrades: builder.mutation<any, any>({
      query: (payload) => ({
        url: "/grades",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Grades", "Students"],
    }),
  }),
});

export const {
  useGetTeacherSubjectsQuery,
  useGetPlacementsQuery,
  useGetStudentsQuery,
  useSaveGradesMutation,
} = gradeApi;
