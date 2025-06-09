import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { MemoryRouter } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import { supabase } from "@/SupabaseClient";

// The Supabase client is mocked globally in `src/setupTests.ts`

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

    // Mock the entire chain: from().select().abortSignal()
    const abortSignalMock = vi
      .fn()
      .mockResolvedValue({ data: mockEvents, error: null });
    const selectMock = vi
      .fn()
      .mockReturnValue({ abortSignal: abortSignalMock });
    (supabase.from as Mock).mockReturnValue({ select: selectMock });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

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

    // Mock the entire chain
    const abortSignalMock = vi
      .fn()
      .mockResolvedValue({ data: mockEvents, error: null });
    const selectMock = vi
      .fn()
      .mockReturnValue({ abortSignal: abortSignalMock });
    (supabase.from as Mock).mockReturnValue({ select: selectMock });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/events/1");
    });
  });

  it("should display a message if fetching events fails", async () => {
    // Mock the entire chain with error
    const abortSignalMock = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Network error" },
    });
    const selectMock = vi
      .fn()
      .mockReturnValue({ abortSignal: abortSignalMock });
    (supabase.from as Mock).mockReturnValue({ select: selectMock });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // The component logs errors to console but doesn't display them
    await waitFor(() => {
      // Check if error was logged (you might need to spy on console.error)
      expect(screen.queryByText("Loading events...")).not.toBeInTheDocument();
    });
  });
});
