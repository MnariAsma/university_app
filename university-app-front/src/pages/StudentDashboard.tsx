import React from "react";
import { Link } from "react-router-dom";
import {
  AutoStories,
  CalendarMonth,
  CircleNotifications,
  ShowChart,
  WarningAmber,
} from "@mui/icons-material";
import useSWR from "swr";
import Card from "../Components/Card";
import { fetcher } from "../baseQuery/BaseQuery";
import { API_BASE_URL } from "../constants/api";
import { ANNOUNCEMENTS, GRADES, TIMETABLE } from "../routes/routes";
import { useAppSelector } from "../hooks/reduxHooks";

type StudentDashboardResponse = {
  profile: {
    firstName: string;
    lastName: string;
    program: string;
    department: string;
    level: string;
    group: string;
  };
  stats: {
    averageGrade: number | null;
    absences: number;
    activeCourses: number;
    unreadNotifications: number;
    eliminationRisks: number;
  };
  nextSession: {
    title: string;
    subject: string;
    room: string | null;
    teacher: string;
    startDate: string;
    endDate: string;
  } | null;
  recentAnnouncements: Array<{
    id: string;
    title: string;
    type: string;
    author: string;
    createdAt: string;
  }>;
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const StudentDashboard: React.FC = () => {
  const token = useAppSelector((state) => state.auth.token);
  const currentUser = useAppSelector((state) => state.auth.user);

  const { data, error, isLoading } = useSWR<StudentDashboardResponse>(
    token ? [`${API_BASE_URL}/dashboard/student`, token] : null,
    ([url, authToken]: [string, string | null]) => fetcher(url, authToken)
  );

  const overviewCards = [
    {
      label: "Average grade",
      value:
        data?.stats.averageGrade !== null && data?.stats.averageGrade !== undefined
          ? data.stats.averageGrade.toFixed(2)
          : "Pending",
      helper: "Current academic average",
      icon: <ShowChart fontSize="small" />,
    },
    {
      label: "Absences",
      value: data?.stats.absences ?? "--",
      helper: "Recorded missed sessions",
      icon: <CalendarMonth fontSize="small" />,
    },
    {
      label: "Available courses",
      value: data?.stats.activeCourses ?? "--",
      helper: "Published learning materials",
      icon: <AutoStories fontSize="small" />,
    },
    {
      label: "Unread alerts",
      value: data?.stats.unreadNotifications ?? "--",
      helper: "Notifications waiting for you",
      icon: <CircleNotifications fontSize="small" />,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <section className="overflow-hidden rounded-[28px] bg-gradient-to-r from-slate-950 via-sky-900 to-cyan-700 px-6 py-7 text-white shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-100/80">
              Student overview
            </p>
            <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
              Welcome back, {data?.profile.firstName ?? currentUser?.firstName ?? "Student"}.
            </h1>
            <p className="max-w-xl text-sm text-slate-100/85 md:text-base">
              Keep an eye on your academic rhythm with one clean snapshot of your progress,
              upcoming class, and latest teaching updates.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-sm text-white/90">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">
                {data?.profile.program ?? "Program pending"}
              </span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">
                {data?.profile.level ?? "Level"} · {data?.profile.group ?? "Group"}
              </span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">
                {data?.profile.department ?? "Department"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to={GRADES}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Review grades
            </Link>
            <Link
              to={TIMETABLE}
              className="rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Open timetable
            </Link>
          </div>
        </div>
      </section>

      {error ? (
        <Card title="Dashboard data unavailable">
          <p className="text-sm text-slate-600">
            {error.message || "Could not fetch dashboard data."}
          </p>
        </Card>
      ) : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((item) => (
          <Card key={item.label} title={item.label}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-3xl font-semibold text-slate-900">
                  {isLoading && !data ? "..." : item.value}
                </p>
                <p className="mt-2 text-sm text-slate-500">{item.helper}</p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                {item.icon}
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card title="Next academic moment">
            {data?.nextSession ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xl font-semibold text-slate-900">{data.nextSession.title}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {data.nextSession.subject} with {data.nextSession.teacher}
                    </p>
                  </div>
                  <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
                    {formatDateTime(data.nextSession.startDate)}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Room</p>
                    <p className="mt-1 font-medium text-slate-800">
                      {data.nextSession.room ?? "Room assignment pending"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Ends</p>
                    <p className="mt-1 font-medium text-slate-800">
                      {formatDateTime(data.nextSession.endDate)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No upcoming session is scheduled yet. Check your timetable later for updates.
              </p>
            )}
          </Card>

          <Card title="Latest announcements">
            {data?.recentAnnouncements.length ? (
              <div className="space-y-3">
                {data.recentAnnouncements.map((announcement) => (
                  <Link
                    key={announcement.id}
                    to={ANNOUNCEMENTS}
                    className="block rounded-2xl border border-slate-100 px-4 py-3 transition hover:border-cyan-200 hover:bg-cyan-50/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{announcement.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{announcement.author}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {announcement.type}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      {formatDateTime(announcement.createdAt)}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No announcements have been published for your stream yet.
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Academic pulse">
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-700">Attendance status</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-2xl font-semibold text-slate-900">
                      {data?.stats.absences ?? 0}
                    </p>
                    <p className="text-sm text-slate-500">absences recorded so far</p>
                  </div>
                  <WarningAmber className="text-amber-500" />
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-700">Elimination alerts</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {data?.stats.eliminationRisks ?? 0}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  subjects currently marked at risk.
                </p>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 p-4 text-white">
                <p className="text-sm font-medium text-slate-200">Best next step</p>
                <p className="mt-2 text-lg font-semibold">
                  {data?.stats.averageGrade && data.stats.averageGrade >= 10
                    ? "Keep momentum by checking fresh announcements before your next class."
                    : "Review your latest grades and upcoming session to recover early."}
                </p>
                <Link
                  to={data?.stats.averageGrade && data.stats.averageGrade >= 10 ? ANNOUNCEMENTS : GRADES}
                  className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900"
                >
                  Open focus area
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;
