/**
 * Auth utilities for enhanced session management and refresh optimization
 */

import { supabase } from "@/SupabaseClient";
import type { Session } from "@supabase/supabase-js";

export interface SessionHealth {
  isValid: boolean;
  expiresAt: number;
  timeToExpiry: number;
  needsRefresh: boolean;
}

/**
 * Check the health of the current session
 */
export const checkSessionHealth = async (): Promise<SessionHealth | null> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return null;
    }

    const now = Date.now() / 1000; // Convert to seconds
    const expiresAt = session.expires_at || 0;
    const timeToExpiry = expiresAt - now;

    return {
      isValid: timeToExpiry > 0,
      expiresAt: expiresAt * 1000, // Convert back to milliseconds
      timeToExpiry: timeToExpiry * 1000, // Convert to milliseconds
      needsRefresh: timeToExpiry < 300, // Refresh if less than 5 minutes remaining
    };
  } catch {
    return null;
  }
};

/**
 * Proactively refresh session if needed
 */
export const ensureValidSession = async (): Promise<Session | null> => {
  const health = await checkSessionHealth();

  if (!health) {
    return null;
  }

  if (!health.isValid || health.needsRefresh) {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return data.session;
    } catch {
      // If refresh fails, return current session without forcing logout
      // This prevents unexpected logouts during refresh attempts
      const { data } = await supabase.auth.getSession();
      return data.session;
    }
  }

  // Session is still valid, return current session
  const { data } = await supabase.auth.getSession();
  return data.session;
};
