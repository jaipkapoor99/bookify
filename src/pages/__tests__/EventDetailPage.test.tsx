import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import EventDetailPage from "@/pages/EventDetailPage";
import { useAuth } from "@/contexts/AuthContext";

// Create a mock navigate function
const mockNavigate = vi.fn();

// Mock necessary components and hooks
vi.mock("react-router-dom", async (importActual) => ({
  ...(await importActual<typeof import("react-router-dom")>()),
  useParams: () => ({ eventId: "1" }),
  useNavigate: () => mockNavigate,
}));

vi.mock("@/contexts/AuthContext");

// Mock the global fetch function that the component now uses
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock environment variables
vi.stubEnv("VITE_SUPABASE_URL", "http://localhost:54321");
vi.stubEnv("VITE_SUPABASE_ANON_KEY", "test-anon-key");

const mockEventData = [
  {
    event_id: 1,
    name: "Summer Music Fest 2025",
    description: "A spectacular summer music festival featuring top artists",
    start_time: "2025-07-15T19:00:00+05:30",
    end_time: "2025-07-15T22:00:00+05:30",
    image_url: "/placeholder.svg",
    image_path: null,
  },
];

const mockEventsVenuesData = [
  {
    event_venue_id: 1,
    event_venue_date: "2025-07-15",
    no_of_tickets: 83,
    price: 250000, // Real price in paise (₹2,500.00)
    venues: {
      venue_name: "Garden City Arena",
      locations: {
        pincode: "400001",
      },
    },
  },
];

describe("EventDetailPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockNavigate.mockClear();

    // Mock successful fetch responses by default
    mockFetch.mockImplementation((url: string) => {
      if (url.includes("events?select=")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockEventData),
        });
      }
      if (url.includes("events_venues?select=")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockEventsVenuesData),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });
  });

  const renderComponent = (user: { id: string } | null = null) => {
    (useAuth as Mock).mockReturnValue({ user });
    return render(
      <MemoryRouter initialEntries={["/events/1"]}>
        <Routes>
          <Route path="/events/:eventId" element={<EventDetailPage />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );
  };

  it("should fetch and display event details including multiple venues", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Summer Music Fest 2025")).toBeInTheDocument();
      expect(
        screen.getByText(
          "A spectacular summer music festival featuring top artists",
        ),
      ).toBeInTheDocument();
    });

    // Check if the section title is rendered correctly
    expect(screen.getByText("Select Venue & Book Tickets")).toBeInTheDocument();

    // Check venue name (from real database)
    expect(screen.getByText("Garden City Arena")).toBeInTheDocument();

    // Check if price is displayed correctly formatted (real database price)
    expect(screen.getByText("₹2,500.00")).toBeInTheDocument();
  });

  it("should open the booking dialog when an authenticated user clicks 'Book Now'", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" } as User;

    renderComponent(mockUser);

    await waitFor(() => {
      expect(screen.getByText("Summer Music Fest 2025")).toBeInTheDocument();
    });

    const bookButtons = screen.getAllByText("Book Now");
    fireEvent.click(bookButtons[0]); // Click the first "Book Now" button

    // Check if the booking dialog appears
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Book Tickets")).toBeInTheDocument(); // Dialog title
    });

    // Check that navigation has NOT been called yet
    expect(mockNavigate).not.toHaveBeenCalled();

    // Check that clicking "Continue to Payment" navigates (updated button text)
    const continueButton = screen.getByRole("button", {
      name: /Continue to Payment/i,
    });
    fireEvent.click(continueButton);

    expect(mockNavigate).toHaveBeenCalledWith(`/book/confirm/1?quantity=1`);
  });

  it("should redirect to login when 'Login to Book' is clicked by an unauthenticated user", async () => {
    renderComponent(null); // No user is logged in

    await waitFor(() => {
      expect(screen.getByText("Summer Music Fest 2025")).toBeInTheDocument();
    });

    const bookButtons = screen.getAllByRole("button", {
      name: /Login to Book/i,
    });
    fireEvent.click(bookButtons[0]);

    // Check that navigation to login was called
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("should display an error message if the event is not found", async () => {
    // Mock fetch to return empty array (no event found)
    mockFetch.mockImplementation((url: string) => {
      if (url.includes("events?select=")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]), // Empty array = no event found
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });

    renderComponent();

    await waitFor(() => {
      // There are multiple "Event not found" texts, so use getAllByText and check for the heading one
      const eventNotFoundTexts = screen.getAllByText(/Event not found/i);
      expect(eventNotFoundTexts.length).toBeGreaterThan(0);
      expect(eventNotFoundTexts[0]).toBeInTheDocument();
    });
  });
});
