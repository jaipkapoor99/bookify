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
import { supabase } from "@/lib/auth-client";

// Mock the Supabase client
vi.mock("@/lib/auth-client", () => ({
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

describe("Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Authentication Flow", () => {
    it("should handle Google OAuth flow", async () => {
      (mockedSupabase.auth.getSession as Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });
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
      (mockedSupabase.auth.getSession as Mock).mockResolvedValue({
        data: { session: null },
        error: null,
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
