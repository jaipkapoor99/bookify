/// <reference types="vitest/globals" />

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  type Mocked,
  type Mock,
} from "vitest";
import { useAuth } from "../AuthContext";
import { supabase } from "@/SupabaseClient";
import { AuthProvider } from "../AuthContext.tsx";

// Mock the Supabase client
vi.mock("@/SupabaseClient", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}));

const mockedSupabase = supabase as Mocked<typeof supabase>;

// Test component to use the auth context
const TestComponent = () => {
  const { user, session, loading, profile, logout, loginWithGoogle } =
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
  });

  describe("Initialization", () => {
    it("should initialize with no session", async () => {
      // Arrange: onAuthStateChange will be called with a null session
      (mockedSupabase.auth.onAuthStateChange as Mock).mockImplementation(
        (callback) => {
          callback("INITIAL_SESSION", null);
          return { data: { subscription: { unsubscribe: vi.fn() } } };
        },
      );

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });

      expect(screen.getByTestId("user-id")).toHaveTextContent("no-user");
      expect(screen.getByTestId("session-token")).toHaveTextContent("no-token");
    });

    it("should initialize with existing session and fetch profile", async () => {
      // Arrange: onAuthStateChange will be called with a mock session
      const mockSession = {
        access_token: "test-token",
        refresh_token: "test-refresh",
        expires_in: 3600,
        token_type: "Bearer",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        user: { id: "test-user-id", email: "test@example.com" } as any,
      };
      const mockProfile = { name: "Test User" };

      (mockedSupabase.auth.onAuthStateChange as Mock).mockImplementation(
        (callback) => {
          callback("INITIAL_SESSION", mockSession);
          return { data: { subscription: { unsubscribe: vi.fn() } } };
        },
      );

      const fromMock = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi
              .fn()
              .mockResolvedValue({ data: mockProfile, error: null }),
          }),
        }),
      });
      (mockedSupabase.from as Mock).mockImplementation(fromMock);

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("user-id")).toHaveTextContent("test-user-id");
        expect(screen.getByTestId("session-token")).toHaveTextContent(
          "test-token",
        );
        expect(screen.getByTestId("profile-name")).toHaveTextContent(
          "Test User",
        );
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });
    });
  });

  describe("Logout", () => {
    it("should logout successfully", async () => {
      (mockedSupabase.auth.signOut as Mock).mockResolvedValue({ error: null });
      renderWithProvider(<TestComponent />);
      fireEvent.click(screen.getByTestId("logout-btn"));
      await waitFor(() => {
        expect(mockedSupabase.auth.signOut).toHaveBeenCalled();
      });
    });
  });

  describe("Google Login", () => {
    it("should initiate Google OAuth flow", async () => {
      (mockedSupabase.auth.signInWithOAuth as Mock).mockResolvedValue({
        data: { provider: "google", url: "https://example.com/auth/google" },
        error: null,
      });
      renderWithProvider(<TestComponent />);
      fireEvent.click(screen.getByTestId("google-login-btn"));
      await waitFor(() => {
        expect(mockedSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
          provider: "google",
        });
      });
    });
  });
});
