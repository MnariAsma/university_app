import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../../constants/api";
import { LOGIN_ENDPOINT } from "../constants/authEndpoints";
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  
  endpoints: (builder) => ({

    login: builder.mutation({
      query: (credentials: any) => {
        return {
          url: LOGIN_ENDPOINT,
          method: "post",
          body: credentials,
        };
      },
    }),

    // logout: builder.mutation({
    //   query: () => ({
    //     url: LOGOUT_ENDPOINT,
    //     method: "POST",
    //   }),
    // }),

    // forgotPassword: builder.mutation({
    //   query: (data: { email: string }) => ({
    //     url: FORGOT_PASSWORD_ENDPOINT,
    //     method: "POST",
    //     body: data,
    //   }),
    // }),

    // resetPassword: builder.mutation({
    //   query: (data: any) => ({
    //     url: RESET_PASSWORD_ENDPOINT,
    //     method: "POST",
    //     body: data,
    //   }),
    // }),
  }),
});

export const { useLoginMutation} = authApi;
