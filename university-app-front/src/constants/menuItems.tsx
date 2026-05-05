import {
  Dashboard as DashboardIcon,
  MeetingRoom,
  EventNote,
  Person,
  CalendarMonth,
  Grade as GradeIcon,
  HowToReg,
  CalendarViewWeek,
  Description as DescriptionIcon,
} from "@mui/icons-material";

import {
  DASHBOARD,
  MEETING_ROOM,
  RESERVATION,
  USERS,
  PROFILE,
  USER_DASHBOARD,
  MY_RESERVATIONS,
  GRADES,
  COURSES,
  PRESENCE,
  TIMETABLE, 
  ANNOUNCEMENTS,
  REQUESTS,

} from "../routes/routes";

import { MENU_TEXT } from "./constants";

export const menuItemsAdmin = [
  { text: MENU_TEXT.dashboard, icon: <DashboardIcon />, path: DASHBOARD },
  { text: MENU_TEXT.rooms, icon: <MeetingRoom />, path: MEETING_ROOM },
  { text: MENU_TEXT.users, icon: <Person />, path: USERS },
  { text: MENU_TEXT.reservations, icon: <EventNote />, path: RESERVATION },
  { text: MENU_TEXT.profile, icon: <Person />, path: PROFILE },
];

export const menuItemsTeacher = [
  { text: MENU_TEXT.dashboard, icon: <DashboardIcon />, path: DASHBOARD },
  { text: MENU_TEXT.grades, icon: <GradeIcon />, path: GRADES },

  { text: "Cours", icon: <EventNote />, path: COURSES },
  { text: MENU_TEXT.presence, icon: <HowToReg />, path: PRESENCE },  
  { text: "Timetable", icon: <CalendarViewWeek />, path: TIMETABLE },
  { text: "Courses", icon: <EventNote />, path: COURSES },

  { text: MENU_TEXT.presence, icon: <HowToReg />, path: PRESENCE },

  { text: "Announcements", icon: <EventNote />, path: ANNOUNCEMENTS },
  { text: MENU_TEXT.profile, icon: <Person />, path: PROFILE },
];

export const menuItemsUser = [
  { text: MENU_TEXT.dashboard, icon: <DashboardIcon />, path: USER_DASHBOARD },
  { text: MENU_TEXT.Courses, icon: <EventNote />, path: COURSES },
  { text: MENU_TEXT.Grades, icon: <GradeIcon />, path: GRADES },
  { text: MENU_TEXT.requests, icon: <DescriptionIcon />, path: REQUESTS },
  { text: MENU_TEXT.Timetable, icon: <CalendarViewWeek />, path: TIMETABLE },
  { text: MENU_TEXT.reservations, icon: <CalendarMonth />, path: MY_RESERVATIONS },
  { text: MENU_TEXT.profile, icon: <Person />, path: PROFILE },
];
