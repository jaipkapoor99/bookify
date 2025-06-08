import { createContext } from "react";
import type { User, Session as AuthSession } from "@supabase/supabase-js";

export type AuthContextType = {
  user: User | null;
  session: AuthSession | null;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
});
