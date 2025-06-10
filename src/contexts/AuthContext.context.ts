import { createContext, useContext } from "react";
import type { User, Session } from "@/lib/api-client";

export type UserProfile = {
  user_id: number;
  address1?: string;
  address2?: string;
  location_id?: number;
  created_at: string;
  updated_at: string;
  supabase_id?: string;
  role: "customer" | "admin";
  name?: string;
};

export type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: UserProfile | null;
  loadingProfile: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<{ error: string | null }>;
  loginWithGoogle: () => Promise<{ error: string | null }>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  profile: null,
  loadingProfile: false,
  login: async () => ({ error: null }),
  logout: async () => ({ error: null }),
  loginWithGoogle: async () => ({ error: null }),
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
