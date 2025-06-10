import {
  useEffect,
  useState,
  type ReactNode,
  useCallback,
  useRef,
} from "react";
import { supabase } from "../SupabaseClient";
import { AuthContext, type UserProfile } from "./AuthContext.context";
import { cleanupAuthStorage } from "@/lib/auth-utils";
import type {
  User,
  Session as AuthSession,
  AuthError,
} from "@supabase/supabase-js";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const loading = false;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Ref to track refresh attempts and prevent excessive retries
  const refreshAttemptsRef = useRef(0);
  const maxRefreshAttempts = 3;
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    } catch {
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  // Enhanced session refresh with timeout and retry logic
  const refreshSession = useCallback(async () => {
    if (refreshAttemptsRef.current >= maxRefreshAttempts) {
      return null;
    }

    refreshAttemptsRef.current++;

    try {
      const { data, error } = await Promise.race([
        supabase.auth.refreshSession(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Refresh timeout")), 10000)
        ),
      ]);

      if (error) throw error;

      // Reset attempts on successful refresh
      refreshAttemptsRef.current = 0;
      return data.session;
    } catch {
      // TEMPORARILY DISABLED: Don't auto-logout on refresh failures
      // Let user continue with existing session to prevent unexpected logouts
      // if (refreshAttemptsRef.current >= maxRefreshAttempts) {
      //   await supabase.auth.signOut();
      //   setSession(null);
      //   setUser(null);
      //   setProfile(null);
      // }
      return null;
    }
  }, []);

  useEffect(() => {
    const getSession = async () => {
      try {
        // Add timeout to prevent hanging (5 seconds for initial session)
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Session timeout")), 5000)
        );

        const {
          data: { session },
        } = await Promise.race([sessionPromise, timeoutPromise]);
        setSession(session);
        setUser(session?.user ?? null);
        await fetchProfile(session?.user ?? null);
      } catch {
        // If session fails, continue with no user - don't throw
        setSession(null);
        setUser(null);
        setProfile(null);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Handle different auth events
        switch (event) {
          case "SIGNED_IN":
          case "TOKEN_REFRESHED":
            setSession(session);
            setUser(session?.user ?? null);
            await fetchProfile(session?.user ?? null);
            // Reset refresh attempts on successful auth events
            refreshAttemptsRef.current = 0;
            break;

          case "SIGNED_OUT":
            setSession(null);
            setUser(null);
            setProfile(null);
            refreshAttemptsRef.current = 0;
            break;

          case "USER_UPDATED":
            if (session?.user) {
              setUser(session.user);
              await fetchProfile(session.user);
            }
            break;

          default:
            // Handle any other events
            setSession(session);
            setUser(session?.user ?? null);
            await fetchProfile(session?.user ?? null);
        }
      }
    );

    // Clean up any expired auth storage on startup
    cleanupAuthStorage();

    // TEMPORARILY DISABLED: Session manager might be causing logout issues
    // const sessionManager = createSessionManager();

    return () => {
      // Capture the current timeout ID to avoid ref staleness warning
      const currentTimeoutId = refreshTimeoutRef.current;

      authListener?.subscription.unsubscribe();
      // sessionManager.cleanup(); // Disabled with session manager
      if (currentTimeoutId) {
        clearTimeout(currentTimeoutId);
      }
    };
  }, [fetchProfile, refreshSession]);

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
    // Clear any pending refresh timeouts - capture ref value to avoid staleness warning
    const currentTimeoutId = refreshTimeoutRef.current;
    if (currentTimeoutId) {
      clearTimeout(currentTimeoutId);
      refreshTimeoutRef.current = null;
    }
    refreshAttemptsRef.current = 0;

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
