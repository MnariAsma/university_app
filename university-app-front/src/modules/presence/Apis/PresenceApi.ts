import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../../constants/api";
import type { RootState } from "../../../store/store";

// ── Types ────────────────────────────────────────────────────────────────────

export interface AttendanceEntry {
  studentId: string;
  status: "PRESENT" | "ABSENT" | "EXCUSED";
}

export interface MarkAttendancePayload {
  attendances: AttendanceEntry[];
}

export interface StudentAttendanceRow {
  studentId: string;
  firstName: string;
  lastName: string;
  matricule: string;
  status: "PRESENT" | "ABSENT" | "EXCUSED" | null;
}

export interface SessionDetail {
  sessionId: string;
  subject: string;
  group: string;
  startDate: string;
  endDate: string;
  students: StudentAttendanceRow[];
}

export interface SessionSummary {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "UPCOMING" | "DONE";
  markedCount: number;
  totalStudents: number;
  isFullyMarked: boolean;
  subject: { id: string; name: string };
  group: { id: string; name: string };
  room: { id: string; name: string } | null;
}

export interface CurrentSessionResponse {
  message?: string;
  session: SessionSummary | null;
  totalStudents?: number;
  markedCount?: number;
  isFullyMarked?: boolean;
}

export interface TodaySessionsResponse {
  message?: string;
  sessions: SessionSummary[];
}

export interface HistorySession {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  subject: { id: string; name: string };
  group: { id: string; name: string };
  room: { id: string; name: string } | null;
  summary: { PRESENT: number; ABSENT: number; EXCUSED: number };
  totalStudents: number;
  isFullyMarked: boolean;
}

export interface HistoryResponse {
  sessions: HistorySession[];
}

export interface HistoryFilters {
  date?: string;
  groupId?: string;
  subjectId?: string;
}

// ── API ──────────────────────────────────────────────────────────────────────

export const presenceApi = createApi({
  reducerPath: "presenceApi",
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
  tagTypes: ["CurrentSession", "TodaySessions", "SessionDetail", "History"],
  endpoints: (builder) => ({

    // GET /absences/teacher/current-session
    getCurrentSession: builder.query<CurrentSessionResponse, void>({
      query: () => "/absences/teacher/current-session",
      providesTags: ["CurrentSession"],
    }),

    // GET /absences/teacher/sessions/today
    getTodaySessions: builder.query<TodaySessionsResponse, void>({
      query: () => "/absences/teacher/sessions/today",
      providesTags: ["TodaySessions"],
    }),

    // GET /absences/teacher/session/:sessionId
    getSessionStudentList: builder.query<SessionDetail, string>({
      query: (sessionId) => `/absences/teacher/session/${sessionId}`,
      providesTags: ["SessionDetail"],
    }),

    // POST /absences/teacher/session/:sessionId
    markAttendance: builder.mutation<{ message: string }, { sessionId: string; payload: MarkAttendancePayload }>({
      query: ({ sessionId, payload }) => ({
        url: `/absences/teacher/session/${sessionId}`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["CurrentSession", "TodaySessions", "SessionDetail", "History"],
    }),

    // GET /absences/teacher/history
    getAttendanceHistory: builder.query<HistoryResponse, HistoryFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters.date) params.append("date", filters.date);
        if (filters.groupId) params.append("groupId", filters.groupId);
        if (filters.subjectId) params.append("subjectId", filters.subjectId);
        return `/absences/teacher/history?${params.toString()}`;
      },
      providesTags: ["History"],
    }),

    // GET /absences/student/my
    getMyAbsences: builder.query<any[], void>({
      query: () => "/absences/student/my",
      providesTags: ["History"],
    }),
  }),
});

export const {
  useGetCurrentSessionQuery,
  useGetTodaySessionsQuery,
  useGetSessionStudentListQuery,
  useMarkAttendanceMutation,
  useGetAttendanceHistoryQuery,
  useGetMyAbsencesQuery,
} = presenceApi;