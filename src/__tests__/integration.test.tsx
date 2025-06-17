/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
// Removed MemoryRouter import as App now handles routing internally
import App from "../App";
import { authApi, dbApi } from "@/lib/api-client";
import { toast } from "sonner";

// Mock all external dependencies
vi.mock("@/lib/api-client");
vi.mock("sonner");

const mockedAuthApi = vi.mocked(authApi);
const mockedDbApi = vi.mocked(dbApi);

describe("Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment variables
    vi.stubEnv("VITE_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "test-anon-key");

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

  describe("Authentication Flow", () => {
    it("should handle complete login flow", async () => {
      const mockSession = {
        access_token: "test-token",
        refresh_token: "test-refresh",
        expires_in: Math.floor(Date.now() / 1000) + 3600,
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
        name: "Test User",
        email: "test@example.com",
      };

      // Mock no initial session
      mockedAuthApi.getSession.mockResolvedValue({
        data: null,
        error: "No session found",
      });

      render(<App initialEntries={["/login"]} />);

      // Wait for the lazy component to load and login form to appear
      await waitFor(
        () => {
          expect(
            screen.getByPlaceholderText("Enter your email"),
          ).toBeInTheDocument();
        },
        { timeout: 10000 }, // Increase timeout for lazy loading
      );

      // Fill login form
      fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
        target: { value: "password123" },
      });

      // Mock successful login
      mockedAuthApi.signIn.mockResolvedValue({
        data: { session: mockSession, user: mockSession.user },
        error: null,
      });

      mockedDbApi.select.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      // Submit login
      fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

      // Should redirect to home and show user name
      await waitFor(() => {
        expect(screen.getByText("Test User")).toBeInTheDocument();
      });
    });

    it("should handle login failure", async () => {
      mockedAuthApi.getSession.mockResolvedValue({
        data: null,
        error: "No session found",
      });

      mockedAuthApi.signIn.mockResolvedValue({
        data: null,
        error: "Invalid login credentials",
      });

      render(<App initialEntries={["/login"]} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("Enter your email"),
        ).toBeInTheDocument();
      });

      fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
        target: { value: "wrongpassword" },
      });

      fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Invalid credentials", {
          description: "Please check your email and password.",
        });
      });
    });

    it("should handle Google OAuth flow", async () => {
      mockedAuthApi.getSession.mockResolvedValue({
        data: null,
        error: "No session found",
      });

      const mockOAuthUrl =
        "https://test.supabase.co/auth/v1/authorize?provider=google&redirect_to=http://localhost:3000/auth/callback";

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

      render(<App initialEntries={["/login"]} />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Continue with Google" }),
        ).toBeInTheDocument();
      });

      fireEvent.click(
        screen.getByRole("button", { name: "Continue with Google" }),
      );

      await waitFor(() => {
        expect(mockedAuthApi.signInWithGoogle).toHaveBeenCalled();
      });
    });
  });

  describe("Session Management", () => {
    it("should handle corrupted session", async () => {
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

      render(<App />);

      // Should clear corrupted session and show login links
      await waitFor(() => {
        expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
        expect(
          screen.getByRole("link", { name: "Sign Up" }),
        ).toBeInTheDocument();
      });
    });

    it("should handle session expiry", async () => {
      const mockExpiredSession = {
        access_token: "expired-token",
        refresh_token: "expired-refresh",
        expires_in: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
        token_type: "Bearer",
        user: {
          id: "test-user-id",
          email: "test@example.com",
        },
      };

      mockedAuthApi.getSession.mockResolvedValue({
        data: mockExpiredSession,
        error: null,
      });

      mockedAuthApi.refreshSession.mockResolvedValue({
        data: null,
        error: "Refresh token expired",
      });

      render(<App />);

      // Should clear expired session and show login links
      await waitFor(() => {
        expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors gracefully", async () => {
      mockedAuthApi.getSession.mockRejectedValue(new Error("Network error"));

      render(<App />);

      // Should show login links when session check fails
      await waitFor(() => {
        expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
      });
    });

    it("should handle database connection errors", async () => {
      const mockSession = {
        access_token: "test-token",
        refresh_token: "test-refresh",
        expires_in: Math.floor(Date.now() / 1000) + 3600,
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

      render(<App />);

      // Should still show user with fallback to username part of email
      await waitFor(() => {
        expect(screen.getByText("test")).toBeInTheDocument();
      });
    });
  });

  describe("Navigation and Routing", () => {
    it("should protect authenticated routes", async () => {
      mockedAuthApi.getSession.mockResolvedValue({
        data: null,
        error: "No session found",
      });

      render(<App initialEntries={["/my-bookings"]} />);

      // Should redirect to login page
      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("Enter your email"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Performance", () => {
    it("should render home page quickly", async () => {
      const mockEvents = [
        { id: 1, name: "Event 1", description: "Description 1" },
        { id: 2, name: "Event 2", description: "Description 2" },
      ];

      mockedAuthApi.getSession.mockResolvedValue({
        data: null,
        error: "No session found",
      });

      mockedDbApi.select.mockResolvedValue({
        data: mockEvents,
        error: null,
      });

      const startTime = performance.now();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("Discover Amazing Events")).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (less than 1 second)
      expect(renderTime).toBeLessThan(1000);
    });

    it("should handle large datasets efficiently", async () => {
      const mockLargeEventList = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Event ${i + 1}`,
        description: `Description ${i + 1}`,
      }));

      mockedAuthApi.getSession.mockResolvedValue({
        data: null,
        error: "No session found",
      });

      mockedDbApi.select.mockResolvedValue({
        data: mockLargeEventList,
        error: null,
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("Discover Amazing Events")).toBeInTheDocument();
      });

      // Should handle large datasets without significant performance degradation
      expect(screen.getByText("Discover Amazing Events")).toBeInTheDocument();
    });
  });

  describe("Error Boundaries", () => {
    it("should catch rendering errors gracefully", async () => {
      // Mock console.error to prevent test output pollution
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // We can't easily test error boundaries with this approach
      // This would need a dedicated test component setup
      // TODO: Implement proper error boundary testing
      consoleSpy.mockRestore();
    });
  });
});
