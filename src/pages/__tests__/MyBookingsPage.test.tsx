import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { MemoryRouter } from "react-router-dom";
import MyBookingsPage from "@/pages/MyBookingsPage";
import { supabase } from "@/SupabaseClient";
import { useAuth } from "@/hooks/useAuth";

// The Supabase client is mocked globally in `src/setupTests.ts`
// We only need to mock the useAuth hook here.
vi.mock("@/hooks/useAuth");

describe("MyBookingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as Mock).mockReturnValue({ user: { id: "user-123" } });
  });

  it("should display a loading message initially", () => {
    // Mock the RPC call to return a promise
    (supabase.rpc as Mock).mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    render(
      <MemoryRouter>
        <MyBookingsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/loading your bookings/i)).toBeInTheDocument();
  });

  it('should display "You have no bookings yet" when no tickets are fetched', async () => {
    // Mock the RPC call to return empty data
    (supabase.rpc as Mock).mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    render(
      <MemoryRouter>
        <MyBookingsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("You have no bookings yet.")).toBeInTheDocument();
    });
  });

  it("should display a list of bookings when tickets are fetched successfully", async () => {
    const mockBookings = [
      {
        ticket_id: 1,
        ticket_price: 2500,
        events_venues: {
          event_venue_date: "2025-11-20T00:00:00",
          venues: {
            venue_name: "City Arena",
          },
          events: {
            name: "Rock Fest 2025",
            image_url: "/rock-fest.png",
          },
        },
      },
      {
        ticket_id: 2,
        ticket_price: 300,
        events_venues: {
          event_venue_date: "2025-12-05T00:00:00",
          venues: {
            venue_name: "Community Theater",
          },
          events: {
            name: "Winter Gala",
            image_url: "/winter-gala.png",
          },
        },
      },
    ];

    // Mock the RPC call to return the mock bookings
    (supabase.rpc as Mock).mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: mockBookings, error: null }),
    });

    render(
      <MemoryRouter>
        <MyBookingsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Rock Fest 2025")).toBeInTheDocument();
      expect(screen.getByText("City Arena")).toBeInTheDocument();
      expect(
        screen.getByText(new Date("2025-11-20").toLocaleDateString())
      ).toBeInTheDocument();
      expect(screen.getByText("Price: ₹2500")).toBeInTheDocument();

      expect(screen.getByText("Winter Gala")).toBeInTheDocument();
      expect(screen.getByText("Community Theater")).toBeInTheDocument();
      expect(
        screen.getByText(new Date("2025-12-05").toLocaleDateString())
      ).toBeInTheDocument();
      expect(screen.getByText("Price: ₹300")).toBeInTheDocument();
    });
  });

  it("should display an error message if fetching bookings fails", async () => {
    const errorMessage = "Failed to fetch bookings";

    // Mock the RPC call to return an error
    (supabase.rpc as Mock).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: null,
        error: { message: errorMessage },
      }),
    });

    render(
      <MemoryRouter>
        <MyBookingsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(`Error fetching bookings: ${errorMessage}`)
      ).toBeInTheDocument();
    });
  });
});
