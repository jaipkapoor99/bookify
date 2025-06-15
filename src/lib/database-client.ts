import axios, { AxiosInstance, AxiosResponse } from "axios";
import { ENV_VARS } from "./constants";
import debug from "./debug";
import { getStoredSession } from "./auth-client";

const SUPABASE_URL = import.meta.env[ENV_VARS.SUPABASE_URL];
const SUPABASE_ANON_KEY = import.meta.env[ENV_VARS.SUPABASE_ANON_KEY];

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  if (import.meta.env.MODE !== "test") {
    throw new Error("Missing Supabase environment variables");
  }
}

// Error interfaces for better type safety
interface SupabaseErrorResponse {
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

// Types for Database API responses
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Create axios instance for Supabase REST API
const dbClient: AxiosInstance = axios.create({
  baseURL: `${SUPABASE_URL}/rest/v1`,
  headers: {
    apikey: SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  },
  timeout: 10000, // 10 second timeout
});

// Set auth token for API requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    dbClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete dbClient.defaults.headers.common["Authorization"];
  }
};

// Initialize auth token from stored session
export const initializeDbAuth = () => {
  const session = getStoredSession();
  if (session) {
    console.log("Initializing database auth with stored session:", {
      hasToken: !!session.access_token,
      userId: session.user?.id,
    });
    setAuthToken(session.access_token);
  }
};

// Initialize on module load
initializeDbAuth();

// Database API functions
export const dbApi = {
  // Generic select query
  select: async <T>(
    table: string,
    columns: string = "*",
    filters?: Record<string, unknown>,
    options?: {
      single?: boolean;
      limit?: number;
      offset?: number;
      orderBy?: string;
    },
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

      const response: AxiosResponse = await dbClient.get(url, { headers });

      return { data: response.data, error: null };
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.message || apiError.message || "Query failed";
      return { data: null, error: errorMessage };
    }
  },

  // Insert data
  insert: async <T>(
    table: string,
    data: Record<string, unknown>,
  ): Promise<ApiResponse<T>> => {
    try {
      const response: AxiosResponse = await dbClient.post(`/${table}`, data);
      return { data: response.data, error: null };
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.message || apiError.message || "Insert failed";
      return { data: null, error: errorMessage };
    }
  },

  // Update data
  update: async <T>(
    table: string,
    data: Record<string, unknown>,
    filters: Record<string, unknown>,
  ): Promise<ApiResponse<T>> => {
    try {
      let url = `/${table}?`;

      // Add filters
      Object.entries(filters).forEach(([key, value], index) => {
        if (index > 0) url += "&";
        url += `${key}=eq.${value}`;
      });

      const response: AxiosResponse = await dbClient.patch(url, data);
      return { data: response.data, error: null };
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.message || apiError.message || "Update failed";
      return { data: null, error: errorMessage };
    }
  },

  // Delete data
  delete: async <T>(
    table: string,
    filters: Record<string, unknown>,
  ): Promise<ApiResponse<T>> => {
    try {
      let url = `/${table}?`;

      // Add filters
      Object.entries(filters).forEach(([key, value], index) => {
        if (index > 0) url += "&";
        url += `${key}=eq.${value}`;
      });

      const response: AxiosResponse = await dbClient.delete(url);
      return { data: response.data, error: null };
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.message || apiError.message || "Delete failed";
      return { data: null, error: errorMessage };
    }
  },

  // Call RPC function
  rpc: async <T>(
    functionName: string,
    params: Record<string, unknown>,
  ): Promise<ApiResponse<T>> => {
    try {
      debug.api(`Calling RPC function: ${functionName}`, {
        functionName,
        params,
        url: `/rpc/${functionName}`,
      });

      const response: AxiosResponse = await dbClient.post(
        `/rpc/${functionName}`,
        params,
      );

      debug.api(`RPC function ${functionName} completed successfully`, {
        status: response.status,
        data: response.data,
      });

      return { data: response.data, error: null };
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.message ||
        apiError.message ||
        "RPC call failed";

      debug.error(`RPC function ${functionName} failed`, {
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        data: apiError.response?.data,
        message: errorMessage,
        params,
        fullError: apiError.response || apiError,
      });

      // Also log to console.error to ensure it appears in terminal
      console.error(
        `🚨 API ERROR: RPC ${functionName} failed with status ${apiError.response?.status}`,
        {
          params,
          response: apiError.response?.data,
          fullError: apiError.response || apiError,
        },
      );

      return { data: null, error: errorMessage };
    }
  },
};
