import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../../constants/api";
import type { RootState } from "../../../store/store";

// ── Types ────────────────────────────────────────────────────────────────────

export interface TimetableSession {
  id: string;
  type: "COURSE" | "TD" | "TP" | "EXAM";
  dayName: string;
  date: string;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  subject: { id: string; name: string; code: string };
  room: { id: string; name: string; building?: string } | null;
  // teacher view only
  group?: {
    id: string;
    name: string;
    code: string;
    level: {
      id: string;
      name: string;
      program: { id: string; name: string; code: string };
    };
  };
  // student view only
  teacher?: { firstName: string; lastName: string };
}

export interface TimetableDay {
  day: string;
  sessions: TimetableSession[];
}

export interface TimetableResponse {
  weekStart: string;
  weekEnd: string;
  timetable: TimetableDay[];
}

// ── API ──────────────────────────────────────────────────────────────────────

export const timetableApi = createApi({
  reducerPath: "timetableApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Timetable"],
  endpoints: (builder) => ({
    getTeacherTimetable: builder.query<TimetableResponse, string | undefined>({
      query: (weekStart) =>
        `/timetable/teacher${weekStart ? `?weekStart=${weekStart}` : ""}`,
      providesTags: ["Timetable"],
    }),
    getStudentTimetable: builder.query<TimetableResponse, string | undefined>({
      query: (weekStart) =>
        `/timetable/student${weekStart ? `?weekStart=${weekStart}` : ""}`,
      providesTags: ["Timetable"],
    }),
  }),
});

export const { useGetTeacherTimetableQuery, useGetStudentTimetableQuery } =
  timetableApi;