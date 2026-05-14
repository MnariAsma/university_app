import PresenceDashboard from "../../modules/presence/Components/PresenceDashboard";
import StudentPresenceDashboard from "../../modules/presence/Components/StudentPresenceDashboard";
import { useAuth } from "../../modules/auth/hooks/useAuth";
import { ROLES } from "../../constants/constants";

const PresencePage = () => {
  const { user } = useAuth();

  return user?.role === ROLES.STUDENT ? (
    <StudentPresenceDashboard />
  ) : (
    <PresenceDashboard />
  );
};

export default PresencePage;