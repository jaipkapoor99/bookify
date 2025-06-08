import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import EventDetailPage from "@/pages/EventDetailPage.tsx";
import { supabase } from "@/SupabaseClient";
import type { Mock } from "vitest";

const mockEvent = {
  event_id: 1,
  name: "Arijit Singh - Live in Concert",
  description: "Experience the soulful voice of Arijit Singh.",
  start_time: "2025-10-05T19:00:00+05:30",
  end_time: "2025-10-07T22:00:00+05:30",
  image_url: "https://example.com/arijit.jpg",
  events_venues: [
    {
      event_venue_date: "2025-10-05",
      venues: {
        venue_name: "NSCI Dome",
      },
    },
    {
      event_venue_date: "2025-10-07",
      venues: {
        venue_name: "UB City Amphitheatre",
      },
    },
  ],
};

const query = `
          *,
          events_venues (
            event_venue_date,
            venues (
              venue_name
            )
          )
        `;

describe("EventDetailPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (
      supabase.from("events").select(query).eq("event_id", "1").single as Mock
    ).mockResolvedValue({ data: mockEvent, error: null });
  });

  it("should fetch and display event details including multiple venues", async () => {
    render(
      <MemoryRouter initialEntries={["/events/1"]}>
        <Routes>
          <Route path="/events/:eventId" element={<EventDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Arijit Singh - Live in Concert/i })
      ).toBeInTheDocument();
    });

    // Check for main event details
    expect(screen.getByText(mockEvent.description)).toBeInTheDocument();
    expect(screen.getByAltText(mockEvent.name)).toBeInTheDocument();

    // Check if the list of venues and dates is rendered
    expect(
      screen.getByRole("heading", { name: /Dates and Venues/i })
    ).toBeInTheDocument();

    expect(screen.getByText("NSCI Dome")).toBeInTheDocument();
    expect(
      screen.getByText(new Date("2025-10-05").toLocaleDateString())
    ).toBeInTheDocument();

    expect(screen.getByText("UB City Amphitheatre")).toBeInTheDocument();
    expect(
      screen.getByText(new Date("2025-10-07").toLocaleDateString())
    ).toBeInTheDocument();

    // Verify the correct Supabase query was made
    expect(supabase.from).toHaveBeenCalledWith("events");
    expect(supabase.from("events").select).toHaveBeenCalledWith(query);
    expect(supabase.from("events").select(query).eq).toHaveBeenCalledWith(
      "event_id",
      "1"
    );
  });

  it("should display an error message if the event is not found", async () => {
    const errorMessage = "Event not found";
    (
      supabase.from("events").select(query).eq("event_id", "999").single as Mock
    ).mockResolvedValue({
      data: null,
      error: { message: errorMessage },
    });

    render(
      <MemoryRouter initialEntries={["/events/999"]}>
        <Routes>
          <Route path="/events/:eventId" element={<EventDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error: Event not found/i)).toBeInTheDocument();
    });
  });
});
