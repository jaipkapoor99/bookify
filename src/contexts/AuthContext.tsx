import { useEffect, useState, type ReactNode, useCallback } from "react";
import { supabase } from "../SupabaseClient";
import { AuthContext, type UserProfile } from "./AuthContext.context";
import type {
  User,
  Session as AuthSession,
  AuthError,
} from "@supabase/supabase-js";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const fetchProfile = useCallback(async (user: User | null) => {
    if (!user) {
      setProfile(null);
      return;
    }

    setLoadingProfile(true);

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("supabase_id", user.id)
        .single();

      if (error) {
        setProfile(null);
      } else if (data) {
        setProfile(data);
      }
    } catch (e) {
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        await fetchProfile(session?.user ?? null);
      } catch (error) {
        // Silently handle session errors
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        await fetchProfile(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const login = async (
    email: string,
    password: string
  ): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const logout = async (): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const loginWithGoogle = async (): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    profile,
    loadingProfile,
    login,
    logout,
    loginWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
// eslint-disable-next-line react-refresh/only-export-components
export { useAuth } from "./AuthContext.context";
