/// <reference types="vitest/globals" />
/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import BookingConfirmationPage from "@/pages/BookingConfirmationPage";
import { supabase } from "@/SupabaseClient";
import { useAuth } from "@/hooks/useAuth";

vi.mock("@/hooks/useAuth");

// Mock window.alert
global.alert = vi.fn();

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("BookingConfirmationPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    (useAuth as any).mockReturnValue({ user: { id: "user-123" } });
    // Setup default mock for functions.invoke
    (supabase.functions.invoke as Mock).mockResolvedValue({
      data: { area: "Metropolis", city: "NY", state: "NY" },
      error: null,
    });
  });

  const renderComponent = () =>
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

  it("should display booking details after a successful fetch", async () => {
    const mockDetails = {
      price: 1500,
      event_venue_date: "2025-10-15T00:00:00",
      events: {
        name: "Tech Conference 2025",
      },
      venues: {
        venue_name: "Grand Convention Hall",
        locations: {
          pincode: "100001",
        },
      },
    };

    // Mock the events_venues query
    (
      supabase.from("events_venues").select().eq("event_venue_id", "1")
        .single as any
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

    // First wait for the basic details to load
    await waitFor(() => {
      expect(screen.getByText("Tech Conference 2025")).toBeInTheDocument();
      expect(screen.getByText("Grand Convention Hall")).toBeInTheDocument();
      expect(screen.getByText("15/10/2025")).toBeInTheDocument();
      expect(screen.getByText("₹1500")).toBeInTheDocument();
    });

    // Then wait for location to NOT be "Loading location..."
    await waitFor(
      () => {
        const locationElement = screen.queryByText("Loading location...");
        expect(locationElement).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Verify the functions.invoke was called with the right pincode
    expect(supabase.functions.invoke).toHaveBeenCalledWith(
      "get-location-from-pincode",
      { body: { pincode: "100001" } }
    );
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
      supabase.from("events_venues").select().eq("event_venue_id", "1")
        .single as any
    ).mockResolvedValueOnce({
      data: mockDetails,
      error: null,
    });
    (supabase.rpc as any).mockResolvedValueOnce({ error: null });

    renderComponent();

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

    // Check that navigation to my-bookings was called
    expect(mockNavigate).toHaveBeenCalledWith("/my-bookings");
  });
});
