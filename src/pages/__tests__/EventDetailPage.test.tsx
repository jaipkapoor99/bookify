import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import EventDetailPage from "@/pages/EventDetailPage";
import { supabase } from "@/SupabaseClient";
import type { Mock } from "vitest";
import { AuthContext } from "@/contexts/AuthContext.context";

// Mock react-router-dom before importing components
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ eventId: "1" }),
    useNavigate: () => mockNavigate,
  };
});

const mockEvent = {
  event_id: 1,
  name: "Arijit Singh - Live in Concert",
  description: "Experience the soulful voice of Arijit Singh.",
  start_time: "2025-10-05T19:00:00+05:30",
  end_time: "2025-10-07T22:00:00+05:30",
  image_url: "https://example.com/arijit.jpg",
  events_venues: [
    {
      event_venue_id: 101, // Unique ID for this specific event-venue
      event_venue_date: "2025-10-05",
      no_of_tickets: 150,
      price: 3500,
      venues: {
        venue_name: "NSCI Dome",
        locations: {
          pincode: "400051",
        },
      },
    },
    {
      event_venue_id: 102, // Unique ID for this specific event-venue
      event_venue_date: "2025-10-07",
      no_of_tickets: 200,
      price: 2800,
      venues: {
        venue_name: "UB City Amphitheatre",
        locations: {
          pincode: "560025",
        },
      },
    },
  ],
};

describe("EventDetailPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Reset the navigation mock
    mockNavigate.mockClear();

    // Mock the edge function for location fetching
    (supabase.functions.invoke as Mock).mockResolvedValue({
      data: { area: "Test Area", city: "Test City", state: "Test State" },
      error: null,
    });

    // Mock the Supabase query chain
    const singleMock = vi
      .fn()
      .mockResolvedValue({ data: mockEvent, error: null });
    const eqMock = vi.fn().mockReturnValue({ single: singleMock });
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
    (supabase.from as Mock).mockReturnValue({ select: selectMock });
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
        screen.getByText("Arijit Singh - Live in Concert")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Experience the soulful voice of Arijit Singh.")
      ).toBeInTheDocument();
      expect(screen.getByText("NSCI Dome")).toBeInTheDocument();
      expect(screen.getByText("UB City Amphitheatre")).toBeInTheDocument();
    });

    // Check if the list of venues and dates is rendered
    expect(screen.getByText("Dates and Venues")).toBeInTheDocument();
    expect(screen.getByText("NSCI Dome")).toBeInTheDocument();

    // Use more flexible date matching
    await waitFor(() => {
      expect(screen.getByText(/Date:.*5.*10.*2025/)).toBeInTheDocument();
    });

    expect(screen.getByText("UB City Amphitheatre")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Date:.*7.*10.*2025/)).toBeInTheDocument();
    });

    // Check if prices are displayed
    expect(screen.getByText(/3500/)).toBeInTheDocument();
    expect(screen.getByText(/2800/)).toBeInTheDocument();

    // Verify the correct Supabase query was made
    expect(supabase.from).toHaveBeenCalledWith("events");
  });

  it("should call the book_ticket RPC function when an authenticated user clicks 'Book Tickets'", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" } as User;

    (supabase.from as Mock).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockEvent, error: null }),
        }),
      }),
    });

    renderComponent(mockUser);

    await waitFor(() => {
      expect(
        screen.getByText("Arijit Singh - Live in Concert")
      ).toBeInTheDocument();
    });

    const bookButtons = screen.getAllByText("Book Tickets");
    fireEvent.click(bookButtons[0]); // Click the first "Book Tickets" button

    // Should navigate to booking confirmation page
    expect(mockNavigate).toHaveBeenCalledWith(
      `/book/confirm/${mockEvent.events_venues[0].event_venue_id}`
    );
  });

  it("should redirect to login when 'Book Tickets' is clicked by an unauthenticated user", async () => {
    renderComponent(null); // No user is logged in

    await waitFor(() => {
      expect(
        screen.getByText("Arijit Singh - Live in Concert")
      ).toBeInTheDocument();
    });

    const bookButtons = screen.getAllByRole("button", {
      name: /Book Tickets/i,
    });
    fireEvent.click(bookButtons[0]);

    // Check that navigation to login was called
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("should display an error message if the event is not found", async () => {
    const errorMessage = "Event not found";

    // Override the default mock for this test
    const singleMock = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: errorMessage } });
    const eqMock = vi.fn().mockReturnValue({ single: singleMock });
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
    (supabase.from as Mock).mockReturnValue({ select: selectMock });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Error: Event not found/i)).toBeInTheDocument();
    });
  });
});
