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

/**
 * Get optimal refresh interval based on session expiry
 */
export const getRefreshInterval = (session: Session | null): number => {
  if (!session?.expires_at) {
    return 50 * 60 * 1000; // Default 50 minutes
  }

  const now = Date.now() / 1000;
  const expiresAt = session.expires_at;
  const timeToExpiry = (expiresAt - now) * 1000; // Convert to ms

  // Refresh at 80% of the expiry time, but not less than 5 minutes
  const refreshTime = Math.max(timeToExpiry * 0.8, 5 * 60 * 1000);

  // Cap at 50 minutes for safety
  return Math.min(refreshTime, 50 * 60 * 1000);
};

/**
 * Enhanced session listener with automatic refresh
 */
export const createSessionManager = () => {
  let refreshTimeoutId: NodeJS.Timeout | null = null;
  let isRefreshing = false;

  const scheduleRefresh = async () => {
    if (refreshTimeoutId) {
      clearTimeout(refreshTimeoutId);
    }

    const session = (await supabase.auth.getSession()).data.session;
    if (!session) return;

    const interval = getRefreshInterval(session);

    refreshTimeoutId = setTimeout(async () => {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          // Only refresh if session exists and is close to expiry
          const currentSession = (await supabase.auth.getSession()).data
            .session;
          if (currentSession) {
            await ensureValidSession();
          }
        } catch {
          // Ignore refresh errors to prevent unexpected logouts
        } finally {
          isRefreshing = false;
          scheduleRefresh(); // Schedule next refresh
        }
      }
    }, interval);
  };

  const cleanup = () => {
    if (refreshTimeoutId) {
      clearTimeout(refreshTimeoutId);
      refreshTimeoutId = null;
    }
    isRefreshing = false;
  };

  // Start scheduling
  scheduleRefresh();

  return {
    scheduleRefresh,
    cleanup,
    isRefreshing: () => isRefreshing,
  };
};

/**
 * Storage optimization - clean up old auth tokens
 */
export const cleanupAuthStorage = () => {
  try {
    // Clean up any orphaned auth storage keys
    const keysToCheck = [
      "supabase.auth.token",
      "booking-platform-auth",
      "booking-platform-signup",
    ];

    keysToCheck.forEach((key) => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          const parsed = JSON.parse(value);
          // Check if token is expired
          if (parsed.expires_at && Date.now() / 1000 > parsed.expires_at) {
            localStorage.removeItem(key);
          }
        } catch {
          // If can't parse, remove it
          localStorage.removeItem(key);
        }
      }
    });
  } catch {
    // Ignore storage errors
  }
};
