import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import EventDetailPage from "@/pages/EventDetailPage.tsx";
import { supabase } from "@/SupabaseClient";
import type { Mock } from "vitest";
import { AuthContext } from "@/contexts/AuthContext.context";

const mockUser = {
  id: "a-mock-user-id",
  // ... other user properties
} as User;

const mockEvent = {
  event_id: 1,
  name: "Arijit Singh - Live in Concert",
  description: "Experience the soulful voice of Arijit Singh.",
  start_time: "2025-10-05T19:00:00+05:30",
  end_time: "2025-10-07T22:00:00+05:30",
  image_url: "https://example.com/arijit.jpg",
  events_venues: [
    {
      id: 101, // Unique ID for this specific event-venue
      event_venue_date: "2025-10-05",
      venues: {
        venue_name: "NSCI Dome",
      },
    },
    {
      id: 102, // Unique ID for this specific event-venue
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
            id,
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

  const renderComponent = (user: User | null = null) => {
    return render(
      <AuthContext.Provider value={{ user, session: null, loading: false }}>
        <MemoryRouter initialEntries={["/events/1"]}>
          <Routes>
            <Route path="/events/:eventId" element={<EventDetailPage />} />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  it("should fetch and display event details including multiple venues", async () => {
    renderComponent();

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

  it("should call the book_ticket RPC function when an authenticated user clicks 'Book Tickets'", async () => {
    // Mock the RPC call for this test
    (supabase.rpc as Mock).mockResolvedValue({ data: null, error: null });

    renderComponent(mockUser);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Arijit Singh - Live in Concert/i })
      ).toBeInTheDocument();
    });

    const bookButtons = screen.getAllByRole("button", {
      name: /Book Tickets/i,
    });
    fireEvent.click(bookButtons[0]);

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith("book_ticket", {
        p_event_venue_id: mockEvent.events_venues[0].id,
        p_user_id: mockUser.id,
      });
    });
  });

  it("should redirect to login when 'Book Tickets' is clicked by an unauthenticated user", async () => {
    renderComponent(null); // No user is logged in

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Arijit Singh - Live in Concert/i })
      ).toBeInTheDocument();
    });

    const bookButtons = screen.getAllByRole("button", {
      name: /Book Tickets/i,
    });
    fireEvent.click(bookButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Login Page")).toBeInTheDocument();
    });
  });

  it("should display an error message if the event is not found", async () => {
    const errorMessage = "Event not found";
    (
      supabase.from("events").select(query).eq("event_id", "999").single as Mock
    ).mockResolvedValue({
      data: null,
      error: { message: errorMessage },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Error: Event not found/i)).toBeInTheDocument();
    });
  });
});
