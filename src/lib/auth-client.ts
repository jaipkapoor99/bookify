import axios, { AxiosInstance, AxiosResponse } from "axios";
import { STORAGE_KEYS, ENV_VARS } from "./constants";

const SUPABASE_URL = import.meta.env[ENV_VARS.SUPABASE_URL];
const SUPABASE_ANON_KEY = import.meta.env[ENV_VARS.SUPABASE_ANON_KEY];

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  if (import.meta.env.MODE !== "test") {
    throw new Error("Missing Supabase environment variables");
  }
}

// Error interfaces for better type safety
interface SupabaseErrorResponse {
  error_description?: string;
  message?: string;
}

interface ApiError {
  response?: {
    data?: SupabaseErrorResponse;
    status?: number;
    statusText?: string;
  };
  message?: string;
}

// Types for Auth API responses
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface User {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: User;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
}

// Create axios instance for Supabase Auth API
const authClient: AxiosInstance = axios.create({
  baseURL: `${SUPABASE_URL}/auth/v1`,
  headers: {
    apikey: SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Session management utilities
export const getStoredSession = (): Session | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SESSION);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const storeSession = (session: Session | null) => {
  if (session) {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }
};

export const getCurrentUser = (): User | null => {
  const session = getStoredSession();
  return session?.user || null;
};

// Auth API functions
export const authApi = {
  // Sign in with email/password
  signIn: async (
    email: string,
    password: string
  ): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response: AxiosResponse = await authClient.post(
        "/token?grant_type=password",
        {
          email,
          password,
        }
      );

      const authData: AuthResponse = response.data;
      if (authData.session) {
        storeSession(authData.session);
      }

      return { data: authData, error: null };
    } catch (error: unknown) {
      const apiError = error as ApiError;
      return {
        data: null,
        error:
          apiError.response?.data?.error_description ||
          apiError.message ||
          "Sign in failed",
      };
    }
  },

  // Sign out
  signOut: async (): Promise<ApiResponse<null>> => {
    try {
      const session = getStoredSession();
      if (session?.access_token) {
        await authClient.post(
          "/logout",
          {},
          {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }
        );
      }
      storeSession(null);
      return { data: null, error: null };
    } catch {
      // Clear local session even if API call fails
      storeSession(null);
      return { data: null, error: null };
    }
  },

  // Get current session
  getSession: async (): Promise<ApiResponse<Session>> => {
    try {
      const storedSession = getStoredSession();
      if (!storedSession) {
        return { data: null, error: "No session found" };
      }

      // Check if token is expired (with 5 minute buffer)
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = storedSession.expires_in;

      if (now >= expiresAt - 300) {
        // 5 minutes before expiry
        // Try to refresh token
        const refreshResult = await authApi.refreshSession(
          storedSession.refresh_token
        );
        if (refreshResult.data) {
          return { data: refreshResult.data, error: null };
        } else {
          storeSession(null);
          return { data: null, error: "Session expired" };
        }
      }

      return { data: storedSession, error: null };
    } catch (error: unknown) {
      const apiError = error as ApiError;
      return { data: null, error: apiError.message || "Failed to get session" };
    }
  },

  // Refresh session
  refreshSession: async (
    refreshToken: string
  ): Promise<ApiResponse<Session>> => {
    try {
      const response: AxiosResponse = await authClient.post("/token", {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      });

      const session: Session = response.data;
      storeSession(session);

      return { data: session, error: null };
    } catch (error: unknown) {
      const apiError = error as ApiError;
      return {
        data: null,
        error:
          apiError.response?.data?.error_description ||
          apiError.message ||
          "Refresh failed",
      };
    }
  },

  // Sign in with Google OAuth
  signInWithGoogle: async (): Promise<ApiResponse<{ url: string }>> => {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;

      // For OAuth, we need to construct the URL and redirect directly
      // Supabase Auth API doesn't return a redirect URL, it expects direct navigation
      const oauthUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(
        redirectUrl
      )}`;

      return { data: { url: oauthUrl }, error: null };
    } catch (error: unknown) {
      const apiError = error as ApiError;
      return {
        data: null,
        error:
          apiError.response?.data?.error_description ||
          apiError.message ||
          "OAuth init failed",
      };
    }
  },
};
