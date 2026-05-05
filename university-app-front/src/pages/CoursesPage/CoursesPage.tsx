import CourseDashboard from "../../modules/course/Components/CourseDashboard";
import StudentCourseDashboard from "../../modules/course/Components/StudentCourseDashboard";
import { useAuth } from "../../modules/auth/hooks/useAuth";
import { ROLES } from "../../constants/constants";

const CoursesPage = () => {
  const { user } = useAuth();

  return (
    <div>
      {user?.role === ROLES.STUDENT ? <StudentCourseDashboard /> : <CourseDashboard />}
    </div>
  );
};

export default CoursesPage;
