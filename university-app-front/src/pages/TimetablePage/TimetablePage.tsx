import TeacherTimetableDashboard from "../../modules/timetable/Teacher/Components/TimetableDashboard";
import StudentTimetableDashboard from "../../modules/timetable/student/Components/TimetableDashboard";
import { useAppSelector } from "../../hooks/reduxHooks";
import { ROLES } from "../../constants/constants";

const TimetablePage = () => {
  const userRole = useAppSelector((state) => state.auth.user?.role);

  if (userRole === ROLES.TEACHER) {
    return <TeacherTimetableDashboard />;
  }

  return <StudentTimetableDashboard />;
};

export default TimetablePage;