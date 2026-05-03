import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";

import { ROLES } from "./constants/constants";
import {
  AUTH,
  DASHBOARD,
  HOME,
  NOTFOUND,
  RESERVATION,
  USERS,
  PROFILE,
  USER_DASHBOARD,
  MY_RESERVATIONS,
  GRADES,
  COURSES,
} from "./routes/routes";
import ToastContainer from "./Components/Toasts/toast";
import LoginPage from "./pages/LoginPage/loginPage";
import TeacherDashboard from "./pages/TeacherDashboard";
import GradesPage from "./pages/GradesPage/GradesPage";
import CoursesPage from "./pages/CoursesPage/CoursesPage";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";
import AppLayout from "./Components/layout/AppLayout";

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path={HOME} element={<Navigate to={AUTH} replace />} />
        <Route path={AUTH} element={<LoginPage />} />

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
