import { useEffect, useState, type ReactNode, useCallback } from "react";
import { supabase } from "../SupabaseClient";
import type { Session, User } from "@supabase/supabase-js";
import { AuthContext, UserProfile } from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (user: User | null) => {
    if (!user) {
      return null;
    }
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("supabase_id", user.id)
        .single();
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
        return null;
      }
      return data;
    } catch (error) {
      console.error("Exception fetching profile:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        const userProfile = await fetchProfile(currentUser);
        setProfile(userProfile);
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
    if (!error) {
      setUser(null);
      setSession(null);
      setProfile(null);
    }
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
