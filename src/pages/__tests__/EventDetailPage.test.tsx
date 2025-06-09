import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import EventDetailPage from "@/pages/EventDetailPage";
import { supabase } from "@/SupabaseClient";
import { useAuth } from "@/hooks/useAuth";

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

// Mock the hooks
vi.mock("@/hooks/useAuth");

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
      price: 350000, // Price in paise
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
      price: 280000, // Price in paise
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

  const renderComponent = (user: { id: string } | null = null) => {
    (useAuth as Mock).mockReturnValue({ user });
    return render(
      <MemoryRouter initialEntries={["/events/1"]}>
        <Routes>
          <Route path="/events/:eventId" element={<EventDetailPage />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
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
    });

    // Check if the list of venues and dates is rendered
    expect(screen.getByText("Dates and Venues")).toBeInTheDocument();

    // Use more flexible date matching by checking for parts of the date string
    const firstVenue = screen
      .getByText("NSCI Dome")
      .closest("div.flex.items-center.justify-between");
    expect(firstVenue).toHaveTextContent("October 5, 2025");

    const secondVenue = screen
      .getByText("UB City Amphitheatre")
      .closest("div.flex.items-center.justify-between");
    expect(secondVenue).toHaveTextContent("October 7, 2025");

    // Check if prices are displayed correctly formatted
    expect(screen.getByText("₹3,500.00")).toBeInTheDocument();
    expect(screen.getByText("₹2,800.00")).toBeInTheDocument();

    // Verify the correct Supabase query was made
    expect(supabase.from).toHaveBeenCalledWith("events");
  });

  it("should open the booking dialog when an authenticated user clicks 'Book Tickets'", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" } as User;

    renderComponent(mockUser);

    await waitFor(() => {
      expect(
        screen.getByText("Arijit Singh - Live in Concert")
      ).toBeInTheDocument();
    });

    const bookButtons = screen.getAllByText("Book Tickets");
    fireEvent.click(bookButtons[0]); // Click the first "Book Tickets" button

    // Check if the booking dialog appears
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Select Ticket Quantity")).toBeInTheDocument();
    });

    // Check that navigation has NOT been called yet
    expect(mockNavigate).not.toHaveBeenCalled();

    // Check that clicking "Continue to Booking" navigates
    const continueButton = screen.getByRole("button", {
      name: /Continue to Booking/i,
    });
    fireEvent.click(continueButton);

    expect(mockNavigate).toHaveBeenCalledWith(
      `/book/confirm/${mockEvent.events_venues[0].event_venue_id}?quantity=1`
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
