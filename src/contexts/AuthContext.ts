import { createContext, useContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

export interface UserProfile {
  user_id: number;
  supabase_id: string;
  name?: string;
  email?: string;
  role?: "customer" | "admin";
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<{ error: string | null }>;
  logout: () => Promise<{ error: string | null }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
