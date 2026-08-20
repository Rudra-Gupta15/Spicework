import { useAuth } from "@/hooks/useAuth";

/** Single place the app ends a session from (sidebar + header menu). */
export const useLogout = (): (() => void) => useAuth().logout;
