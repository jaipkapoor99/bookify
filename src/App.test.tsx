import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "./App";

// Mock the supabase client
vi.mock("./SupabaseClient", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  },
}));

describe("App", () => {
  it("renders headline", () => {
    render(<App />);
    const headline = screen.getByText(/Hello World/i);
    expect(headline).toBeInTheDocument();
  });
});
