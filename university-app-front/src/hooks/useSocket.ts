import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAppDispatch } from "./reduxHooks";
import { notificationApi, type Notification } from "../modules/notification/api/notificationApi";
import { courseApi } from "../modules/course/Apis/CourseApi";
import { announcementApi } from "../modules/announcement/api/announcementApi";
import { API_BASE_URL } from "../constants/api";
import { storageHelper } from "../utils/localstorageHelper";
import { STORAGE_KEYS } from "../constants/constants";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = storageHelper.getItem(STORAGE_KEYS.token);
    if (!token) return;

    const socketInstance = io(API_BASE_URL, {
      // auth object is sent in the socket.io handshake (works for both WS and polling)
      auth: { token },
      // transports: try websocket first, fall back to polling
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketInstance.on("connect", () => {
      console.log("[Socket] Connected successfully, id:", socketInstance.id);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message);
    });

    socketInstance.on("disconnect", (reason) => {
      console.warn("[Socket] Disconnected:", reason);
    });

    socketInstance.on("new_notification", (notification: Notification) => {
      console.log("[Socket] New notification received:", notification);

      // 1. Prepend to notifications list in RTK Query cache
      dispatch(
        notificationApi.util.updateQueryData(
          "getNotifications",
          undefined,
          (draft: Notification[]) => {
            draft.unshift(notification);
          }
        )
      );

      // 2. Auto-refresh course list when a new course is added
      if (notification.type === "COURSE") {
        dispatch(courseApi.util.invalidateTags(["Courses"]));
      }

      // 3. Auto-refresh announcement list when a new announcement is added
      if (notification.type === "ANNOUNCEMENT") {
        dispatch(announcementApi.util.invalidateTags(["Announcements"]));
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [dispatch]);

  return socket;
};
