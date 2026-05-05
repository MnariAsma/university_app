import GradeDashboard from "../../modules/grade/Components/GradeDashboard";
import StudentGradeDashboard from "../../modules/grade/Components/StudentGradeDashboard";
import { useAuth } from "../../modules/auth/hooks/useAuth";
import { ROLES } from "../../constants/constants";

const GradesPage = () => {
  const { user } = useAuth();

  return user?.role === ROLES.STUDENT ? <StudentGradeDashboard /> : <GradeDashboard />;
};

export default GradesPage;
