import { api } from "@/lib/api";
import { saveSession, type AuthResponse, type AuthUser } from "@/lib/authSession";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  organization_name: string;
  email: string;
  password: string;
  first_name: string;
  last_name?: string;
}

/**
 * Both calls store the session on success, so callers only have to navigate.
 * Failures throw `ApiError` with the backend's message — 401 for bad
 * credentials, 409 for an email that is already registered.
 */

export const login = async (payload: LoginPayload): Promise<AuthUser> => {
  const result = await api.post<AuthResponse>("/api/auth/login", payload);
  saveSession(result);
  return result.user;
};

export const register = async (payload: RegisterPayload): Promise<AuthUser> => {
  const result = await api.post<AuthResponse>("/api/auth/register", payload);
  saveSession(result);
  return result.user;
};

/** The account behind the current token, read fresh from the server. */
export const fetchCurrentUser = (): Promise<AuthUser> =>
  api.get<AuthUser>("/api/auth/me");
