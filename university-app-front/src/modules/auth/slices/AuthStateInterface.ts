import type { User } from "../../../types/types";

export interface AuthState {
  user: User | null;
  token: string | null;
}