import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "./App";

// Mock the AuthContext
vi.mock("./contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    loading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock the supabase client (basic mock, might need expansion for other tests)
vi.mock("@/SupabaseClient", () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  },
}));

describe("App", () => {
  it("renders the main application layout", async () => {
    render(<App />);

    await waitFor(() => {
      const headline = screen.getByText(/Booking Platform/i);
      expect(headline).toBeInTheDocument();
    });
  });
});
