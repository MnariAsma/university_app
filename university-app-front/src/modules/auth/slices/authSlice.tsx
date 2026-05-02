import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../../types/types";
import type { AuthState } from "./AuthStateInterface";
import { storageHelper } from "../../../utils/localstorageHelper";
import { STORAGE_KEYS } from "../../../constants/constants";

const storedToken = storageHelper.getItem(STORAGE_KEYS.token);
const storedUser = storageHelper.getItem(STORAGE_KEYS.user);

let parsedUser: User | null = null;

if (storedUser) {
  try {
    parsedUser = JSON.parse(storedUser);
  } catch (e) {
    console.warn("Invalid JSON in localStorage for user:", storedUser);
    storageHelper.removeItem(STORAGE_KEYS.user);
  }
}

const initialState: AuthState = {
  user: parsedUser,
  token: storedToken || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      storageHelper.setItem(STORAGE_KEYS.token, action.payload.token);
      storageHelper.setItem(STORAGE_KEYS.user, JSON.stringify(action.payload.user || null));
    },

    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      storageHelper.removeItem(STORAGE_KEYS.token);
      storageHelper.removeItem(STORAGE_KEYS.user);
    },

    updateUserSession: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        storageHelper.setItem(STORAGE_KEYS.user, JSON.stringify(state.user));
      }
    },
  },
});

export const { setCredentials, clearCredentials, updateUserSession } = authSlice.actions;
export default authSlice.reducer;
