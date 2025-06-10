import { useEffect, useState, type ReactNode, useCallback } from "react";
import { AuthContext, type UserProfile } from "./AuthContext.context";
import { authApi, dbApi, type User, type Session } from "@/lib/api-client";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const loading = false;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const fetchProfile = useCallback(async (user: User | null) => {
    if (!user) {
      setProfile(null);
      return;
    }

    setLoadingProfile(true);

    try {
      const { data, error } = await dbApi.select<UserProfile>(
        "users",
        "*",
        { supabase_id: user.id },
        { single: true }
      );

      if (error) {
        console.warn("Profile fetch error:", error);
        setProfile(null);
      } else if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.warn("Profile fetch exception:", error);
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const { data: session, error } = await authApi.getSession();

        if (error) {
          console.warn("Session initialization error:", error);
          setSession(null);
          setUser(null);
          setProfile(null);
          return;
        }

        if (session) {
          console.log("AuthContext: Initializing with session", {
            hasToken: !!session.access_token,
            userId: session.user?.id,
          });
          setSession(session);
          setUser(session.user);
          await fetchProfile(session.user);
        } else {
          console.log("AuthContext: No session found");
        }
      } catch (error) {
        console.warn("Session initialization exception:", error);
        setSession(null);
        setUser(null);
        setProfile(null);
      }
    };

    initializeSession();
  }, [fetchProfile]);

  const login = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    try {
      const { data, error } = await authApi.signIn(email, password);

      if (error) {
        return { error };
      }

      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
        await fetchProfile(data.session.user);
      }

      return { error: null };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      return { error: errorMessage };
    }
  };

  const logout = async (): Promise<{ error: string | null }> => {
    try {
      const { error } = await authApi.signOut();

      // Clear state regardless of API response
      setSession(null);
      setUser(null);
      setProfile(null);

      return { error };
    } catch (error: unknown) {
      // Clear state even if logout API fails
      setSession(null);
      setUser(null);
      setProfile(null);
      const errorMessage =
        error instanceof Error ? error.message : "Logout failed";
      return { error: errorMessage };
    }
  };

  const loginWithGoogle = async (): Promise<{ error: string | null }> => {
    try {
      const { data, error } = await authApi.signInWithGoogle();

      if (error) {
        return { error };
      }

      if (data?.url) {
        // Redirect to Google OAuth URL
        window.location.href = data.url;
      }

      return { error: null };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Google login failed";
      return { error: errorMessage };
    }
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
