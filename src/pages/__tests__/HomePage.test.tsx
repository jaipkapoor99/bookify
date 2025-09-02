import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import { supabase } from "@/SupabaseClient";

// Mock the supabase client
vi.mock("@/SupabaseClient", () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
  },
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
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
        image_url: "/rock-concert.jpg",
        events_venues: [{ venues: { venue_name: "Rock Arena" } }],
      },
      {
        event_id: 2,
        name: "Jazz Night",
        start_time: "2025-06-25T20:00:00",
        image_url: "/jazz-night.jpg",
        events_venues: [{ venues: { venue_name: "Jazz Club" } }],
      },
    ];

    vi.mocked(supabase.from("events").select("*").order).mockResolvedValueOnce({
      data: mockEvents,
      error: null,
      count: null,
      status: 0,
      statusText: "",
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
        image_url: "/rock-concert.jpg",
        events_venues: [{ venues: { venue_name: "Rock Arena" } }],
      },
    ];

    vi.mocked(supabase.from("events").select("*").order).mockResolvedValueOnce({
      data: mockEvents,
      error: null,
      count: null,
      status: 0,
      statusText: "",
    });

    renderWithProviders(<HomePage />);

    await waitFor(() => {
      const links = screen.getAllByRole("link", {
        name: /view details/i,
      });
      expect(links[0]).toHaveAttribute("href", "/events/1");
    });
  });

  it("should display a message if no events are available", async () => {
    vi.mocked(supabase.from("events").select("*").order).mockResolvedValueOnce({
      data: [],
      error: null,
      count: null,
      status: 0,
      statusText: "",
    });

    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("No events found")).toBeInTheDocument();
    });
  });
});
