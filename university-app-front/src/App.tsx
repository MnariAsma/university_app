import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import { ROLES } from "./constants/constants";
import {
  AUTH,
  DASHBOARD,
  HOME,
  NOTFOUND,
  GRADES,
  COURSES,
  PRESENCE,
  ANNOUNCEMENTS,
  REQUESTS,
  TIMETABLE,
  STUDENT_DASHBOARD,
  TEACHER_DASHBOARD,
} from "./routes/routes";
import ToastContainer from "./Components/Toasts/toast";
import LoginPage from "./pages/LoginPage/loginPage";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import GradesPage from "./pages/GradesPage/GradesPage";
import CoursesPage from "./pages/CoursesPage/CoursesPage";
import PresencePage from "./pages/PresencePage/PresencePage";
import TimetablePage from "./pages/TimetablePage/TimetablePage";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";
import AnnouncementsPage from "./pages/AnnouncementsPage/AnnouncementsPage";
import AppLayout from "./Components/layout/AppLayout";
import RequestsPage from "./pages/RequestsPage/RequestsPage";
import { useAppSelector } from "./hooks/reduxHooks";

function DashboardEntry() {
  const user = useAppSelector((state) => state.auth.user);

  if (user?.role === ROLES.TEACHER) {
    return <Navigate to={TEACHER_DASHBOARD} replace />;
  }

  if (user?.role === ROLES.STUDENT) {
    return <Navigate to={STUDENT_DASHBOARD} replace />;
  }

  return <Navigate to={AUTH} replace />;
}

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path={HOME} element={<Navigate to={AUTH} replace />} />
        <Route path={AUTH} element={<LoginPage />} />
        <Route path={DASHBOARD} element={<DashboardEntry />} />

        {/* Teacher routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.TEACHER]} />}>
          <Route
            path={TEACHER_DASHBOARD}
            element={
              <AppLayout>
                <TeacherDashboard />
              </AppLayout>
            }
          />
        </Route>

        {/* Student routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
          <Route
            path={STUDENT_DASHBOARD}
            element={
              <AppLayout>
                <StudentDashboard />
              </AppLayout>
            }
          />
          <Route
            path={REQUESTS}
            element={
              <AppLayout>
                <RequestsPage />
              </AppLayout>
            }
          />
        </Route>

        {/* Shared routes for Teacher and Student */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.STUDENT]} />}>
          <Route
            path={COURSES}
            element={
              <AppLayout>
                <CoursesPage />
              </AppLayout>
            }
          />
          <Route
            path={GRADES}
            element={
              <AppLayout>
                <GradesPage />
              </AppLayout>
            }
          />
          <Route
            path={ANNOUNCEMENTS}
            element={
              <AppLayout>
                <AnnouncementsPage />
              </AppLayout>
            }
          />
          <Route
            path={PRESENCE}
            element={
              <AppLayout>
                <PresencePage />
              </AppLayout>
            }
          />
          <Route
            path={TIMETABLE}
            element={
              <AppLayout>
                <TimetablePage />
              </AppLayout>
            }
          />
        </Route>

        <Route path={NOTFOUND} element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
