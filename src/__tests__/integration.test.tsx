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
import App from "../App";
import { supabase } from "@/SupabaseClient";

// Mock the Supabase client
vi.mock("@/SupabaseClient", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      })),
    })),
  },
}));

const mockedSupabase = supabase as Mocked<typeof supabase>;

describe("Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Authentication Flow", () => {
    it("should handle Google OAuth flow", async () => {
      (mockedSupabase.auth.signInWithOAuth as Mock).mockResolvedValue({
        data: { provider: "google", url: "https://example.com/auth/google" },
        error: null,
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
        expect(mockedSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
          provider: "google",
        });
      });
    });
  });

  describe("Navigation and Routing", () => {
    it("should protect authenticated routes", async () => {
      // Simulate no user being logged in
      const onAuthStateChange = mockedSupabase.auth.onAuthStateChange as Mock;
      onAuthStateChange.mockImplementation((callback) => {
        callback("INITIAL_SESSION", null);
        return {
          data: { subscription: { unsubscribe: vi.fn() } },
        };
      });

      render(<App initialEntries={["/my-bookings"]} />);
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /continue with google/i }),
        ).toBeInTheDocument();
      });
    });
  });
});
