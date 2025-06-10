import { useEffect, useState, type ReactNode, useCallback } from "react";
import { AuthContext, type UserProfile } from "./AuthContext.context";
import { authApi, dbApi, type User, type Session } from "@/lib/api-client";
import { STORAGE_KEYS, DEFAULTS } from "@/lib/constants";
import debug from "@/lib/debug";

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

    if (!user.id) {
      console.error("User ID is missing:", user);
      setProfile(null);
      return;
    }

    setLoadingProfile(true);

    try {
      // First, try to get existing profile (without single: true to avoid 406 errors)
      const { data, error } = await dbApi.select<UserProfile>("users", "*", {
        supabase_id: user.id,
      });

      if (data && Array.isArray(data) && data.length > 0) {
        // Profile exists, use the first one
        setProfile(data[0]);
      } else if (
        !data ||
        (Array.isArray(data) && data.length === 0) ||
        error?.includes("PGRST116") ||
        error?.includes("no rows")
      ) {
        // Profile doesn't exist, create it for OAuth users
        debug.auth("Creating new user profile for OAuth user", {
          userId: user.id,
        });

        const newProfile = {
          supabase_id: user.id,
          name:
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            DEFAULTS.USER_NAME,
          created_at: new Date().toISOString(),
        };

        const createResult = await dbApi.insert("users", newProfile);
        const createError = createResult?.error;

        if (createError) {
          console.warn("Failed to create user profile:", createError);
          setProfile(null);
        } else {
          debug.success("Successfully created user profile");
          // Fetch the created profile
          const { data: fetchedProfile } = await dbApi.select<UserProfile>(
            "users",
            "*",
            { supabase_id: user.id }
          );
          if (
            fetchedProfile &&
            Array.isArray(fetchedProfile) &&
            fetchedProfile.length > 0
          ) {
            setProfile(fetchedProfile[0]);
          } else {
            setProfile(null);
          }
        }
      } else {
        console.warn("Profile fetch error:", error);
        setProfile(null);
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
          debug.error("Session initialization error", error);
          setSession(null);
          setUser(null);
          setProfile(null);
          return;
        }

        if (session) {
          debug.auth("Initializing with session", {
            hasToken: !!session.access_token,
            userId: session.user?.id,
            fullUser: session.user,
          });

          // Validate that user has required fields
          if (!session.user?.id) {
            debug.error("Session user missing ID, clearing corrupted session");
            // Clear corrupted session
            localStorage.removeItem(STORAGE_KEYS.SESSION);
            setSession(null);
            setUser(null);
            setProfile(null);
            return;
          }

          // Ensure auth token is set before making database calls
          const { setAuthToken } = await import("@/lib/api-client");
          setAuthToken(session.access_token);

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
