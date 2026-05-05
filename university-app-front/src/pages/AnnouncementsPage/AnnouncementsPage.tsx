import React from "react";
import AnnouncementDashboard from "../../modules/announcement/Components/AnnouncementDashboard";
import StudentAnnouncementDashboard from "../../modules/announcement/Components/StudentAnnouncementDashboard";
import { useAuth } from "../../modules/auth/hooks/useAuth";
import { ROLES } from "../../constants/constants";

const AnnouncementsPage = () => {
  const { user } = useAuth();

  return user?.role === ROLES.STUDENT ? (
    <StudentAnnouncementDashboard />
  ) : (
    <AnnouncementDashboard />
  );
};

export default AnnouncementsPage;
