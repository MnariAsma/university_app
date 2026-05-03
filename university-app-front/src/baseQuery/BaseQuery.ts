import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { API_BASE_URL } from "../constants/api";
import type { RootState } from "../store/store";

export const BaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers: Headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});
