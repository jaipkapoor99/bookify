import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { MemoryRouter } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import { supabase } from "@/SupabaseClient";
import { AppStateProvider } from "@/contexts/AppStateProvider";
import React from "react";

// The Supabase client is mocked globally in `src/setupTests.ts`

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <AppStateProvider>{ui}</AppStateProvider>
    </MemoryRouter>
  );
};

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display events when they are fetched successfully", async () => {
    const mockEvents = [
      {
        event_id: 1,
        name: "Rock Concert",
        start_time: "2025-06-21T18:00:00",
        venue_id: 1,
        image_url: "/rock-concert.jpg",
      },
      {
        event_id: 2,
        name: "Jazz Night",
        start_time: "2025-06-25T20:00:00",
        venue_id: 2,
        image_url: "/jazz-night.jpg",
      },
    ];

    (supabase.from as Mock).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockEvents, error: null }),
    });

    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("Rock Concert")).toBeInTheDocument();
      expect(screen.getByText("Jazz Night")).toBeInTheDocument();
    });
  });

  it("should wrap event cards in links to the event detail page", async () => {
    const mockEvents = [
      {
        event_id: 1,
        name: "Rock Concert",
        start_time: "2025-06-21T18:00:00",
        venue_id: 1,
        image_url: "/rock-concert.jpg",
      },
    ];

    (supabase.from as Mock).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockEvents, error: null }),
    });

    renderWithProviders(<HomePage />);

    await waitFor(() => {
      const links = screen.getAllByRole("link", { name: /view details/i });
      expect(links[0]).toHaveAttribute("href", "/events/1");
    });
  });

  it("should display a message if fetching events fails", async () => {
    (supabase.from as Mock).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: "Network error" } }),
    });

    renderWithProviders(<HomePage />);

    await waitFor(() => {
      // The app state context will catch the error and toast it.
      // The page itself will show "0 Events Found".
      expect(screen.getByText("0 Events Found")).toBeInTheDocument();
    });
  });
});
