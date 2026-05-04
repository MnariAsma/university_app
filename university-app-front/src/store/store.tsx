import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../modules/auth/Apis/AuthApi";
import { gradeApi } from "../modules/grade/Apis/GradeApi";
import { courseApi } from "../modules/course/Apis/CourseApi";

import { presenceApi } from "../modules/presence/Apis/PresenceApi";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "../modules/auth/slices/authSlice";
import toastReducer from "../slices/toast/toastSlice";
import { announcementApi } from "../modules/announcement/api/announcementApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    toast: toastReducer,
    [authApi.reducerPath]: authApi.reducer,
    [gradeApi.reducerPath]: gradeApi.reducer,
    [courseApi.reducerPath]: courseApi.reducer,

    [presenceApi.reducerPath]: presenceApi.reducer,
    [announcementApi.reducerPath]: announcementApi.reducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      gradeApi.middleware,
      courseApi.middleware,

      presenceApi.middleware,

      announcementApi.middleware

    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
setupListeners(store.dispatch);