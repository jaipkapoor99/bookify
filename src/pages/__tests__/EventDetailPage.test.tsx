import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import EventDetailPage from "@/pages/EventDetailPage.tsx";
import { type Event } from "@/pages/HomePage"; // Re-using the type

// Mock Supabase client
const singleMock = vi.fn();
const eqMock = vi.fn(() => ({ single: singleMock }));
const selectMock = vi.fn(() => ({ eq: eqMock }));
const fromMock = vi.fn(() => ({ select: selectMock }));

vi.mock("@/SupabaseClient", () => ({
  supabase: {
    from: fromMock,
  },
}));

const mockEvent: Event & { description: string; venues: { name: string } } = {
  event_id: 1,
  name: "Tech Conference 2024",
  start_time: "2024-10-26T09:00:00Z",
  venue_id: 1,
  image_url: "https://example.com/tech-conf.jpg",
  description: "A deep dive into the latest in web development and AI.",
  venues: { name: "Convention Center" },
};

describe("EventDetailPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should fetch and display event details based on URL parameter", async () => {
    // Mock the single select query for a specific event
    singleMock.mockResolvedValueOnce({ data: mockEvent, error: null });

    render(
      <MemoryRouter initialEntries={[`/events/${mockEvent.event_id}`]}>
        <Routes>
          <Route path="/events/:eventId" element={<EventDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Initially, it might show a loading state
    expect(screen.getByText(/Loading event details.../i)).toBeInTheDocument();

    // Wait for the event details to be displayed
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Tech Conference 2024/i })
      ).toBeInTheDocument();
    });

    // Check query was called correctly
    expect(fromMock).toHaveBeenCalledWith("events");
    expect(selectMock).toHaveBeenCalledWith("*, venues(name)");
    expect(eqMock).toHaveBeenCalledWith("event_id", `${mockEvent.event_id}`);

    // Check for all the details
    expect(screen.getByText(mockEvent.description)).toBeInTheDocument();
    const eventImage = screen.getByRole("img");
    expect(eventImage).toHaveAttribute("src", mockEvent.image_url);
    expect(eventImage).toHaveAttribute("alt", mockEvent.name);
  });

  it("should display an error message if the event is not found", async () => {
    const errorMessage = "Event not found";
    singleMock.mockResolvedValueOnce({
      data: null,
      error: { message: errorMessage },
    });

    render(
      <MemoryRouter initialEntries={[`/events/999`]}>
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
