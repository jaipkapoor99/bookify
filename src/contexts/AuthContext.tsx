import {
  useEffect,
  useState,
  type ReactNode,
  useCallback,
  createContext,
  useContext,
} from "react";
import { supabase } from "@/lib/auth-client";
import type { Session, User } from "@supabase/supabase-js";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface UserProfile {
  user_id: number;
  supabase_id: string;
  name?: string;
  email?: string;
  role?: "customer" | "admin";
}

interface AuthContextType {
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (user: User | null) => {
    if (!user) {
      setProfile(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("supabase_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 means no rows found
        console.error("Error fetching profile:", error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error("Exception fetching profile:", error);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      await fetchProfile(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        await fetchProfile(session?.user ?? null);
        setLoading(false);
      },
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    return { error: error?.message || null };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    return { error: error?.message || null };
  };

  const value = {
    user,
    session,
    profile,
    loading,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

