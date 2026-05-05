import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import { ROLES } from "./constants/constants";
import {
  AUTH,
  DASHBOARD,
  HOME,
  NOTFOUND,
  PROFILE,
  USER_DASHBOARD,
  GRADES,
  COURSES,
  PRESENCE,
  ANNOUNCEMENTS,
  REQUESTS,
  TIMETABLE,
} from "./routes/routes";
import ToastContainer from "./Components/Toasts/toast";
import LoginPage from "./pages/LoginPage/loginPage";
import TeacherDashboard from "./pages/TeacherDashboard";
import GradesPage from "./pages/GradesPage/GradesPage";
import CoursesPage from "./pages/CoursesPage/CoursesPage";
import PresencePage from "./pages/PresencePage/PresencePage";
import TimetablePage from "./pages/TimetablePage/TimetablePage";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";
import AppLayout from "./Components/layout/AppLayout";
import AnnouncementDashboard from "./modules/announcement/Components/AnnouncementDashboard";
import RequestsPage from "./pages/RequestsPage/RequestsPage";

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path={HOME} element={<Navigate to={AUTH} replace />} />
        <Route path={AUTH} element={<LoginPage />} />

        {/* Teacher routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.TEACHER]} />}>
          <Route
            path={DASHBOARD}
            element={
              <AppLayout>
                <TeacherDashboard />
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
            path={PRESENCE}
            element={
              <AppLayout>
                <PresencePage />
              </AppLayout>
            }
          />
          <Route
            path={ANNOUNCEMENTS}
            element={
              <AppLayout>
                <AnnouncementDashboard />
              </AppLayout>
            }
          />
        </Route>

        {/* Student routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
          <Route
            path={REQUESTS}
            element={
              <AppLayout>
                <RequestsPage />
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
        </Route>

        <Route path={NOTFOUND} element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
