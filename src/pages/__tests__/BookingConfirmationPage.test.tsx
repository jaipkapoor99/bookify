import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import BookingConfirmationPage from "@/pages/BookingConfirmationPage";
import { supabase } from "@/SupabaseClient";

// Mock the entire Supabase client
vi.mock("@/SupabaseClient", () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    rpc: vi.fn(),
  },
}));

// Mock the useAuth hook
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "user-123" } }),
}));

describe("BookingConfirmationPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display a loading message initially", () => {
    (
      supabase.from("events_venues").select().eq().single as vi.Mock
    ).mockResolvedValueOnce({
      data: null,
      error: null,
    });

    render(
      <MemoryRouter initialEntries={["/book/confirm/1"]}>
        <Routes>
          <Route
            path="/book/confirm/:eventVenueId"
            element={<BookingConfirmationPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByText(/loading confirmation details/i)
    ).toBeInTheDocument();
  });

  it("should display booking details after a successful fetch", async () => {
    const mockDetails = {
      price: 1500,
      event_venue_date: "2025-10-15T00:00:00",
      events: { name: "Tech Conference 2025" },
      venues: {
        venue_name: "Grand Convention Hall",
        locations: { city: "Metropolis", state: "NY" },
      },
    };

    (
      supabase.from("events_venues").select().eq().single as vi.Mock
    ).mockResolvedValueOnce({
      data: mockDetails,
      error: null,
    });

    render(
      <MemoryRouter initialEntries={["/book/confirm/1"]}>
        <Routes>
          <Route
            path="/book/confirm/:eventVenueId"
            element={<BookingConfirmationPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Confirm Your Booking")).toBeInTheDocument();
    });

    expect(screen.getByText("Tech Conference 2025")).toBeInTheDocument();
    expect(screen.getByText("Grand Convention Hall")).toBeInTheDocument();
    expect(screen.getByText("Metropolis, NY")).toBeInTheDocument();
    expect(screen.getByText("10/15/2025")).toBeInTheDocument(); // Checks date formatting
    expect(screen.getByText("₹1500")).toBeInTheDocument();
  });

  it("should call the book_ticket RPC and redirect on successful booking", async () => {
    const mockDetails = {
      price: 1500,
      event_venue_date: "2025-10-15T00:00:00",
      events: { name: "Tech Conference 2025" },
      venues: {
        venue_name: "Grand Convention Hall",
        locations: { city: "Metropolis", state: "NY" },
      },
    };
    (
      supabase.from("events_venues").select().eq().single as vi.Mock
    ).mockResolvedValueOnce({
      data: mockDetails,
      error: null,
    });
    (supabase.rpc as vi.Mock).mockResolvedValueOnce({ error: null });

    // Mock alert
    window.alert = vi.fn();

    render(
      <MemoryRouter initialEntries={["/book/confirm/1"]}>
        <Routes>
          <Route
            path="/book/confirm/:eventVenueId"
            element={<BookingConfirmationPage />}
          />
          <Route path="/my-bookings" element={<div>My Bookings</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Confirm & Book Ticket")).toBeInTheDocument();
    });

    const bookButton = screen.getByText("Confirm & Book Ticket");
    fireEvent.click(bookButton);

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith("book_ticket", {
        p_event_venue_id: 1,
      });
    });

    expect(window.alert).toHaveBeenCalledWith(
      "Booking successful! Redirecting to your bookings page..."
    );

    await waitFor(() => {
      expect(screen.getByText("My Bookings")).toBeInTheDocument();
    });
  });
});
