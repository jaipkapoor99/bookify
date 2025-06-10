import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  STORAGE_KEYS,
  API_ENDPOINTS,
  ENV_VARS,
  DEFAULTS,
  OAUTH_PROVIDERS,
} from "./constants";
import debug from "./debug";

const SUPABASE_URL = import.meta.env[ENV_VARS.SUPABASE_URL];
const SUPABASE_ANON_KEY = import.meta.env[ENV_VARS.SUPABASE_ANON_KEY];

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  if (import.meta.env.MODE !== "test") {
    throw new Error("Missing Supabase environment variables");
  }
}

// Create axios instance for Supabase REST API
const apiClient: AxiosInstance = axios.create({
  baseURL: `${SUPABASE_URL}/rest/v1`,
  headers: {
    apikey: SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  },
  timeout: 10000, // 10 second timeout
});

// Create axios instance for Supabase Auth API
const authClient: AxiosInstance = axios.create({
  baseURL: `${SUPABASE_URL}/auth/v1`,
  headers: {
    apikey: SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Types for API responses
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface User {
  id: string;
  email?: string;
  user_metadata?: any;
  app_metadata?: any;
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

// Auth token management
let currentAccessToken: string | null = null;

// Set auth token for API requests
const setAuthToken = (token: string | null) => {
  currentAccessToken = token;
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
};

// Get auth token from localStorage
const getStoredSession = (): Session | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SESSION);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// Store session in localStorage
const storeSession = (session: Session | null) => {
  if (session) {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    setAuthToken(session.access_token);
  } else {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    setAuthToken(null);
  }
};

// Initialize auth token from stored session
const initializeAuth = () => {
  const session = getStoredSession();
  if (session) {
    console.log("Initializing auth with stored session:", {
      hasToken: !!session.access_token,
      userId: session.user?.id,
    });
    setAuthToken(session.access_token);
  }
};

// Initialize on module load
initializeAuth();

// Get current user from stored session
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
    } catch (error: any) {
      return {
        data: null,
        error:
          error.response?.data?.error_description ||
          error.message ||
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
    } catch (error: any) {
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
    } catch (error: any) {
      return { data: null, error: error.message || "Failed to get session" };
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
    } catch (error: any) {
      return {
        data: null,
        error:
          error.response?.data?.error_description ||
          error.message ||
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
    } catch (error: any) {
      return {
        data: null,
        error:
          error.response?.data?.error_description ||
          error.message ||
          "OAuth init failed",
      };
    }
  },
};

// Database API functions
export const dbApi = {
  // Generic select query
  select: async <T>(
    table: string,
    columns: string = "*",
    filters?: Record<string, any>,
    options?: {
      single?: boolean;
      limit?: number;
      offset?: number;
      orderBy?: string;
    }
  ): Promise<ApiResponse<T>> => {
    try {
      let url = `/${table}?select=${columns}`;

      // Add filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url += `&${key}=eq.${value}`;
          }
        });
      }

      // Add options
      if (options?.limit) url += `&limit=${options.limit}`;
      if (options?.offset) url += `&offset=${options.offset}`;
      if (options?.orderBy) url += `&order=${options.orderBy}`;

      const headers: Record<string, string> = {};
      if (options?.single) {
        headers["Accept"] = "application/vnd.pgrst.object+json";
      }

      const response: AxiosResponse = await apiClient.get(url, { headers });

      return { data: response.data, error: null };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Query failed";
      return { data: null, error: errorMessage };
    }
  },

  // Insert data
  insert: async <T>(table: string, data: any): Promise<ApiResponse<T>> => {
    try {
      const response: AxiosResponse = await apiClient.post(`/${table}`, data);
      return { data: response.data, error: null };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Insert failed";
      return { data: null, error: errorMessage };
    }
  },

  // Update data
  update: async <T>(
    table: string,
    data: any,
    filters: Record<string, any>
  ): Promise<ApiResponse<T>> => {
    try {
      let url = `/${table}?`;

      // Add filters
      Object.entries(filters).forEach(([key, value], index) => {
        if (index > 0) url += "&";
        url += `${key}=eq.${value}`;
      });

      const response: AxiosResponse = await apiClient.patch(url, data);
      return { data: response.data, error: null };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Update failed";
      return { data: null, error: errorMessage };
    }
  },

  // Delete data
  delete: async <T>(
    table: string,
    filters: Record<string, any>
  ): Promise<ApiResponse<T>> => {
    try {
      let url = `/${table}?`;

      // Add filters
      Object.entries(filters).forEach(([key, value], index) => {
        if (index > 0) url += "&";
        url += `${key}=eq.${value}`;
      });

      const response: AxiosResponse = await apiClient.delete(url);
      return { data: response.data, error: null };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Delete failed";
      return { data: null, error: errorMessage };
    }
  },

  // Call RPC function
  rpc: async <T>(
    functionName: string,
    params: Record<string, any>
  ): Promise<ApiResponse<T>> => {
    try {
      debug.api(`Calling RPC function: ${functionName}`, {
        functionName,
        params,
        url: `/rpc/${functionName}`,
      });

      const response: AxiosResponse = await apiClient.post(
        `/rpc/${functionName}`,
        params
      );

      debug.api(`RPC function ${functionName} completed successfully`, {
        status: response.status,
        data: response.data,
      });

      return { data: response.data, error: null };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "RPC call failed";

      debug.error(`RPC function ${functionName} failed`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: errorMessage,
        params,
        fullError: error.response || error,
      });

      // Also log to console.error to ensure it appears in terminal
      console.error(
        `🚨 API ERROR: RPC ${functionName} failed with status ${error.response?.status}`,
        {
          params,
          response: error.response?.data,
          fullError: error.response || error,
        }
      );

      return { data: null, error: errorMessage };
    }
  },
};

// Export utilities
export { setAuthToken, getStoredSession, storeSession };
