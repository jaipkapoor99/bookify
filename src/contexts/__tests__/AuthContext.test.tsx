/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "../AuthContext";
import { authApi, dbApi } from "@/lib/api-client";

// Mock the API client
vi.mock("@/lib/api-client");

const mockedAuthApi = vi.mocked(authApi);
const mockedDbApi = vi.mocked(dbApi);

// Test component to use the auth context
const TestComponent = () => {
  const { user, session, loading, profile, login, logout, loginWithGoogle } =
    useAuth();

  return (
    <div>
      <div data-testid="user-id">{user?.id || "no-user"}</div>
      <div data-testid="user-email">{user?.email || "no-email"}</div>
      <div data-testid="session-token">
        {session?.access_token || "no-token"}
      </div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="profile-name">{profile?.name || "no-profile"}</div>
      <button
        data-testid="login-btn"
        onClick={() => login("test@example.com", "password")}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
      <button data-testid="google-login-btn" onClick={loginWithGoogle}>
        Google Login
      </button>
    </div>
  );
};

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<AuthProvider>{ui}</AuthProvider>);
};

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
  });

  describe("Initialization", () => {
    it("should initialize with no session", async () => {
      mockedAuthApi.getSession.mockResolvedValue({
        data: null,
        error: "No session found",
      });

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("user-id")).toHaveTextContent("no-user");
        expect(screen.getByTestId("session-token")).toHaveTextContent(
          "no-token",
        );
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });
    });

    it("should initialize with existing session", async () => {
      const mockSession = {
        access_token: "test-token",
        refresh_token: "test-refresh",
        expires_in: 3600,
        token_type: "Bearer",
        user: {
          id: "test-user-id",
          email: "test@example.com",
          user_metadata: { full_name: "Test User" },
        },
      };

      const mockProfile = {
        user_id: 1,
        supabase_id: "test-user-id",
        name: "Test User Profile",
        email: "test@example.com",
      };

      mockedAuthApi.getSession.mockResolvedValue({
        data: mockSession,
        error: null,
      });

      mockedDbApi.select.mockResolvedValue({
        data: [mockProfile],
        error: null,
      });

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("user-id")).toHaveTextContent("test-user-id");
        expect(screen.getByTestId("user-email")).toHaveTextContent(
          "test@example.com",
        );
        expect(screen.getByTestId("session-token")).toHaveTextContent(
          "test-token",
        );
        expect(screen.getByTestId("profile-name")).toHaveTextContent(
          "Test User Profile",
        );
      });
    });

    it("should clear corrupted session on initialization", async () => {
      const mockCorruptedSession = {
        access_token: "test-token",
        refresh_token: "test-refresh",
        expires_in: 3600,
        token_type: "Bearer",
        user: {
          id: "", // Empty ID - corrupted
          email: "test@example.com",
        },
      };

      mockedAuthApi.getSession.mockResolvedValue({
        data: mockCorruptedSession,
        error: null,
      });

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("user-id")).toHaveTextContent("no-user");
        expect(screen.getByTestId("session-token")).toHaveTextContent(
          "no-token",
        );
      });
    });
  });

  describe("Login", () => {
    it("should login successfully", async () => {
      const mockSession = {
        access_token: "new-token",
        refresh_token: "new-refresh",
        expires_in: 3600,
        token_type: "Bearer",
        user: {
          id: "new-user-id",
          email: "test@example.com",
        },
      };

      const mockProfile = {
        user_id: 1,
        supabase_id: "new-user-id",
        name: "New User",
        email: "test@example.com",
      };

      mockedAuthApi.getSession.mockResolvedValue({
        data: null,
        error: "No session found",
      });

      mockedAuthApi.signIn.mockResolvedValue({
        data: { session: mockSession, user: mockSession.user },
        error: null,
      });

      mockedDbApi.select.mockResolvedValue({
        data: [mockProfile],
        error: null,
      });

      renderWithProvider(<TestComponent />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId("user-id")).toHaveTextContent("no-user");
      });

      // Click login
      fireEvent.click(screen.getByTestId("login-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("user-id")).toHaveTextContent("new-user-id");
        expect(screen.getByTestId("session-token")).toHaveTextContent(
          "new-token",
        );
        expect(screen.getByTestId("profile-name")).toHaveTextContent(
          "New User",
        );
      });

      expect(mockedAuthApi.signIn).toHaveBeenCalledWith(
        "test@example.com",
        "password",
      );
    });

    it("should handle login error", async () => {
      mockedAuthApi.getSession.mockResolvedValue({
        data: null,
        error: "No session found",
      });

      mockedAuthApi.signIn.mockResolvedValue({
        data: null,
        error: "Invalid login credentials",
      });

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("user-id")).toHaveTextContent("no-user");
      });

      fireEvent.click(screen.getByTestId("login-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("user-id")).toHaveTextContent("no-user");
        expect(screen.getByTestId("session-token")).toHaveTextContent(
          "no-token",
        );
      });
    });
  });

  describe("Logout", () => {
    it("should logout successfully", async () => {
      const mockSession = {
        access_token: "test-token",
        refresh_token: "test-refresh",
        expires_in: 3600,
        token_type: "Bearer",
        user: {
          id: "test-user-id",
          email: "test@example.com",
        },
      };

      mockedAuthApi.getSession.mockResolvedValue({
        data: mockSession,
        error: null,
      });

      mockedDbApi.select.mockResolvedValue({
        data: null,
        error: "No rows found",
      });

      mockedAuthApi.signOut.mockResolvedValue({
        data: null,
        error: null,
      });

      renderWithProvider(<TestComponent />);

      // Wait for initial session load
      await waitFor(() => {
        expect(screen.getByTestId("user-id")).toHaveTextContent("test-user-id");
      });

      // Click logout
      fireEvent.click(screen.getByTestId("logout-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("user-id")).toHaveTextContent("no-user");
        expect(screen.getByTestId("session-token")).toHaveTextContent(
          "no-token",
        );
        expect(screen.getByTestId("profile-name")).toHaveTextContent(
          "no-profile",
        );
      });

      expect(mockedAuthApi.signOut).toHaveBeenCalled();
    });

    it("should clear state even if logout API fails", async () => {
      const mockSession = {
        access_token: "test-token",
        refresh_token: "test-refresh",
        expires_in: 3600,
        token_type: "Bearer",
        user: {
          id: "test-user-id",
          email: "test@example.com",
        },
      };

      mockedAuthApi.getSession.mockResolvedValue({
        data: mockSession,
        error: null,
      });

      mockedDbApi.select.mockResolvedValue({
        data: null,
        error: "No rows found",
      });

      mockedAuthApi.signOut.mockResolvedValue({
        data: null,
        error: "Logout failed",
      });

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("user-id")).toHaveTextContent("test-user-id");
      });

      fireEvent.click(screen.getByTestId("logout-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("user-id")).toHaveTextContent("no-user");
        expect(screen.getByTestId("session-token")).toHaveTextContent(
          "no-token",
        );
      });
    });
  });

  describe("Google Login", () => {
    it("should initiate Google OAuth flow", async () => {
      const mockOAuthUrl =
        "https://test.supabase.co/auth/v1/authorize?provider=google";

      mockedAuthApi.getSession.mockResolvedValue({
        data: null,
        error: "No session found",
      });

      mockedAuthApi.signInWithGoogle.mockResolvedValue({
        data: { url: mockOAuthUrl },
        error: null,
      });

      // Mock window.location.href assignment
      const mockLocation = { href: "" };
      Object.defineProperty(window, "location", {
        value: mockLocation,
        writable: true,
      });

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("user-id")).toHaveTextContent("no-user");
      });

      fireEvent.click(screen.getByTestId("google-login-btn"));

      await waitFor(() => {
        expect(mockedAuthApi.signInWithGoogle).toHaveBeenCalled();
      });
    });

    it("should handle Google login error", async () => {
      mockedAuthApi.getSession.mockResolvedValue({
        data: null,
        error: "No session found",
      });

      mockedAuthApi.signInWithGoogle.mockResolvedValue({
        data: null,
        error: "OAuth init failed",
      });

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("user-id")).toHaveTextContent("no-user");
      });

      fireEvent.click(screen.getByTestId("google-login-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("user-id")).toHaveTextContent("no-user");
      });
    });
  });

  describe("Profile Management", () => {
    it("should fetch profile after successful login", async () => {
      const mockSession = {
        access_token: "test-token",
        refresh_token: "test-refresh",
        expires_in: 3600,
        token_type: "Bearer",
        user: {
          id: "test-user-id",
          email: "test@example.com",
        },
      };

      const mockProfile = {
        user_id: 1,
        supabase_id: "test-user-id",
        name: "John Doe",
        email: "test@example.com",
      };

      mockedAuthApi.getSession.mockResolvedValue({
        data: null,
        error: "No session found",
      });

      mockedAuthApi.signIn.mockResolvedValue({
        data: { session: mockSession, user: mockSession.user },
        error: null,
      });

      mockedDbApi.select.mockResolvedValue({
        data: [mockProfile],
        error: null,
      });

      renderWithProvider(<TestComponent />);

      fireEvent.click(screen.getByTestId("login-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("profile-name")).toHaveTextContent(
          "John Doe",
        );
      });

      expect(mockedDbApi.select).toHaveBeenCalledWith("users", "*", {
        supabase_id: "test-user-id",
      });
    });

    it("should handle profile fetch error gracefully", async () => {
      const mockSession = {
        access_token: "test-token",
        refresh_token: "test-refresh",
        expires_in: 3600,
        token_type: "Bearer",
        user: {
          id: "test-user-id",
          email: "test@example.com",
        },
      };

      mockedAuthApi.getSession.mockResolvedValue({
        data: mockSession,
        error: null,
      });

      mockedDbApi.select.mockResolvedValue({
        data: null,
        error: "Database connection failed",
      });

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("user-id")).toHaveTextContent("test-user-id");
        expect(screen.getByTestId("profile-name")).toHaveTextContent(
          "no-profile",
        );
      });
    });

    it("should not fetch profile if user ID is missing", async () => {
      const mockSession = {
        access_token: "test-token",
        refresh_token: "test-refresh",
        expires_in: 3600,
        token_type: "Bearer",
        user: {
          id: "",
          email: "test@example.com",
        },
      };

      mockedAuthApi.getSession.mockResolvedValue({
        data: mockSession,
        error: null,
      });

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("user-id")).toHaveTextContent("no-user");
      });

      expect(mockedDbApi.select).not.toHaveBeenCalled();
    });
  });
});
