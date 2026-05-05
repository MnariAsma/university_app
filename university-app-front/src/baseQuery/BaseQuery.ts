import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { API_BASE_URL } from "../constants/api";
import type { RootState } from "../store/store";

type FetcherError = Error & {
  info?: unknown;
  status?: number;
};

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

export const fetcher = async (url: string, token: string | null) => {
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    let info: unknown = null;

    try {
      info = await res.json();
    } catch {
      info = await res.text();
    }

    const error = new Error(
      typeof info === "object" && info !== null && "message" in info
        ? String((info as { message?: string }).message)
        : `Request failed with status ${res.status}`
    ) as FetcherError;

    error.info = info;
    error.status = res.status;

    throw error;
  }

  return res.json();
};
