/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock environment variables
Object.defineProperty(import.meta, "env", {
  value: {
    VITE_SUPABASE_URL: "https://test.supabase.co",
    VITE_SUPABASE_ANON_KEY: "test-anon-key",
  },
  writable: true,
});

describe("API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe("Session Management", () => {
    it("should store session in localStorage", async () => {
      // Dynamically import to ensure mocks are set up
      const { storeSession } = await import("../api-client");

      const mockSession = {
        access_token: "test-token",
        refresh_token: "test-refresh",
        expires_in: 3600,
        token_type: "Bearer",
        user: { id: "test-user-id", email: "test@example.com" },
      };

      storeSession(mockSession);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "booking-platform-session",
        JSON.stringify(mockSession)
      );
    });

    it("should retrieve session from localStorage", async () => {
      const { getStoredSession } = await import("../api-client");

      const mockSession = {
        access_token: "test-token",
        refresh_token: "test-refresh",
        expires_in: 3600,
        token_type: "Bearer",
        user: { id: "test-user-id", email: "test@example.com" },
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSession));

      const session = getStoredSession();

      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        "booking-platform-session"
      );
      expect(session).toEqual(mockSession);
    });

    it("should clear session from localStorage", async () => {
      const { storeSession } = await import("../api-client");

      storeSession(null);

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "booking-platform-session"
      );
    });

    it("should handle corrupted localStorage data", async () => {
      const { getStoredSession } = await import("../api-client");

      localStorageMock.getItem.mockReturnValue("invalid-json");

      const session = getStoredSession();

      expect(session).toBeNull();
    });
  });

  describe("API Functions", () => {
    it("should have authApi with required methods", async () => {
      const { authApi } = await import("../api-client");

      expect(authApi).toBeDefined();
      expect(typeof authApi.signIn).toBe("function");
      expect(typeof authApi.signOut).toBe("function");
      expect(typeof authApi.getSession).toBe("function");
      expect(typeof authApi.signInWithGoogle).toBe("function");
      expect(typeof authApi.refreshSession).toBe("function");
    });

    it("should have dbApi with required methods", async () => {
      const { dbApi } = await import("../api-client");

      expect(dbApi).toBeDefined();
      expect(typeof dbApi.select).toBe("function");
      expect(typeof dbApi.insert).toBe("function");
      expect(typeof dbApi.update).toBe("function");
      expect(typeof dbApi.delete).toBe("function");
      expect(typeof dbApi.rpc).toBe("function");
    });

    it("should have utility functions", async () => {
      const { setAuthToken, getCurrentUser } = await import("../api-client");

      expect(typeof setAuthToken).toBe("function");
      expect(typeof getCurrentUser).toBe("function");
    });
  });

  describe("Error Handling", () => {
    it("should handle getSession with no stored session", async () => {
      const { authApi } = await import("../api-client");

      localStorageMock.getItem.mockReturnValue(null);

      const result = await authApi.getSession();

      expect(result.data).toBeNull();
      expect(result.error).toBe("No session found");
    });

    it("should handle getCurrentUser with no session", async () => {
      const { getCurrentUser } = await import("../api-client");

      localStorageMock.getItem.mockReturnValue(null);

      const user = getCurrentUser();

      expect(user).toBeNull();
    });

    it("should handle getCurrentUser with valid session", async () => {
      const { getCurrentUser } = await import("../api-client");

      const mockSession = {
        access_token: "test-token",
        refresh_token: "test-refresh",
        expires_in: 3600,
        token_type: "Bearer",
        user: { id: "test-user-id", email: "test@example.com" },
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSession));

      const user = getCurrentUser();

      expect(user).toEqual(mockSession.user);
    });
  });

  describe("Google OAuth", () => {
    it("should generate Google OAuth URL", async () => {
      const { authApi } = await import("../api-client");

      // Mock window.location.origin
      Object.defineProperty(window, "location", {
        value: { origin: "http://localhost:3000" },
        writable: true,
      });

      const result = await authApi.signInWithGoogle();

      expect(result.data?.url).toContain("auth/v1/authorize");
      expect(result.data?.url).toContain("provider=google");
      expect(result.data?.url).toContain("redirect_to=");
      expect(result.error).toBeNull();
    });
  });
});
