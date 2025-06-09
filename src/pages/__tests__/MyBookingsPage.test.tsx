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
    // Mock the from().select() call to never resolve (simulate loading)
    (supabase.from as Mock).mockReturnValue({
      select: vi.fn().mockImplementation(() => new Promise(() => {})), // Never resolves
    });

    render(
      <MemoryRouter>
        <MyBookingsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Loading your bookings...")).toBeInTheDocument();
  });

  it("should display bookings when data is loaded successfully", async () => {
    const mockBookings = [
      {
        ticket_id: 1,
        ticket_price: 500,
        created_at: "2025-11-15T00:00:00Z",
        events_venues: {
          event_venue_date: "2025-11-20",
          price: 500,
          venues: {
            venue_name: "City Arena",
            locations: {
              pincode: "110001",
            },
          },
          events: {
            name: "Rock Fest 2025",
            image_url: "/rock-fest.png",
            image_path: null,
          },
        },
      },
      {
        ticket_id: 2,
        ticket_price: 300,
        created_at: "2025-11-10T00:00:00Z",
        events_venues: {
          event_venue_date: "2025-12-05",
          price: 300,
          venues: {
            venue_name: "Community Theater",
            locations: {
              pincode: "110002",
            },
          },
          events: {
            name: "Winter Gala",
            image_url: "/winter-gala.png",
            image_path: null,
          },
        },
      },
    ];

    const mockQuantityData = [
      { ticket_id: 1, quantity: 2 },
      { ticket_id: 2, quantity: 1 },
    ];

    // Mock the first query (main ticket data)
    let selectCallCount = 0;
    (supabase.from as Mock).mockReturnValue({
      select: vi.fn().mockImplementation(() => {
        selectCallCount++;

        if (selectCallCount === 1) {
          // First call - main ticket data without quantity
          return Promise.resolve({ data: mockBookings, error: null });
        } else if (selectCallCount === 2) {
          // Second call - quantity data with .in() filter
          return {
            in: vi
              .fn()
              .mockResolvedValue({ data: mockQuantityData, error: null }),
          };
        }

        return Promise.resolve({ data: [], error: null });
      }),
    });

    // Mock the functions.invoke call for location fetching since we only get pincode from DB
    (supabase.functions.invoke as Mock).mockImplementation((name, params) => {
      if (name === "get-location-from-pincode") {
        const pincode = params.body.pincode;
        if (pincode === "110001") {
          return Promise.resolve({
            data: {
              area: "Connaught Place",
              city: "New Delhi",
              state: "Delhi",
            },
            error: null,
          });
        } else if (pincode === "110002") {
          return Promise.resolve({
            data: { area: "Karol Bagh", city: "New Delhi", state: "Delhi" },
            error: null,
          });
        }
      }
      return Promise.resolve({ data: null, error: { message: "Not found" } });
    });

    render(
      <MemoryRouter>
        <MyBookingsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Rock Fest 2025")).toBeInTheDocument();
      expect(screen.getByText("Winter Gala")).toBeInTheDocument();
    });

    // Wait for location details to be fetched and displayed
    await waitFor(() => {
      expect(
        screen.getByText(/Connaught Place, New Delhi, Delhi/)
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Karol Bagh, New Delhi, Delhi/)
      ).toBeInTheDocument();
    });

    // Check quantities
    expect(screen.getByText("2 tickets")).toBeInTheDocument();
    expect(screen.getByText("1 ticket")).toBeInTheDocument();

    // Check formatted prices and totals
    expect(screen.getByText("₹500.00")).toBeInTheDocument(); // Individual ticket price
    expect(screen.getByText("₹1,000.00")).toBeInTheDocument(); // Total for 2 tickets
    expect(screen.getAllByText("₹300.00")).toHaveLength(2); // Individual and total for 1 ticket (both should be same)
  });

  it("should display 'no bookings' message when the user has no tickets", async () => {
    // Mock the from().select() calls to return empty data
    (supabase.from as Mock).mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    render(
      <MemoryRouter>
        <MyBookingsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("You have no bookings yet")).toBeInTheDocument();
      expect(
        screen.getByText("Start exploring events and book your tickets")
      ).toBeInTheDocument();
    });
  });

  it("should display error message when there is a fetch error", async () => {
    // Mock the from().select() call to return an error
    (supabase.from as Mock).mockReturnValue({
      select: vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: "Network error" } }),
    });

    render(
      <MemoryRouter>
        <MyBookingsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Error Loading Bookings")).toBeInTheDocument();
      expect(
        screen.getByText("Error fetching bookings: Network error")
      ).toBeInTheDocument();
    });
  });

  it("should handle missing quantity column gracefully", async () => {
    const mockBookings = [
      {
        ticket_id: 1,
        ticket_price: 500,
        created_at: "2025-11-15T00:00:00Z",
        events_venues: {
          event_venue_date: "2025-11-20",
          price: 500,
          venues: {
            venue_name: "City Arena",
            locations: {
              pincode: "110001",
            },
          },
          events: {
            name: "Rock Fest 2025",
            image_url: "/rock-fest.png",
            image_path: null,
          },
        },
      },
    ];

    let selectCallCount = 0;
    (supabase.from as Mock).mockReturnValue({
      select: vi.fn().mockImplementation(() => {
        selectCallCount++;

        if (selectCallCount === 1) {
          // First call - main ticket data
          return Promise.resolve({ data: mockBookings, error: null });
        } else if (selectCallCount === 2) {
          // Second call - quantity query fails (column doesn't exist)
          return {
            in: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "column tickets.quantity does not exist" },
            }),
          };
        }

        return Promise.resolve({ data: [], error: null });
      }),
    });

    render(
      <MemoryRouter>
        <MyBookingsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Rock Fest 2025")).toBeInTheDocument();
      // Should default to 1 ticket when quantity column doesn't exist
      expect(screen.getByText("1 ticket")).toBeInTheDocument();
    });
  });
});
