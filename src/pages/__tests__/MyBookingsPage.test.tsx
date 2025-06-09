import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { MemoryRouter } from "react-router-dom";
import MyBookingsPage from "@/pages/MyBookingsPage";
import { supabase } from "@/SupabaseClient";
import { useAuth } from "@/contexts/AuthContext";

// The Supabase client is mocked globally in `src/setupTests.ts`
// We only need to mock the useAuth hook here.
vi.mock("@/contexts/AuthContext");

describe("MyBookingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as Mock).mockReturnValue({ user: { id: "user-123" } });
  });

  it("should display a loading message initially", () => {
    // Mock the from().select().eq() call chain to never resolve (simulate loading)
    (supabase.from as Mock).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockImplementation(() => new Promise(() => {})), // Never resolves
        }),
      }),
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
        quantity: 2,
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
        quantity: 1,
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

    // Simplified mock for the entire call chain
    (supabase.from as Mock).mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { user_id: 1 },
            error: null,
          }),
        };
      }
      if (table === "tickets") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({
            data: mockBookings,
            error: null,
          }),
        };
      }
      return {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
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
    expect(screen.getByText("₹5.00")).toBeInTheDocument(); // Individual ticket price
    expect(screen.getByText("₹10.00")).toBeInTheDocument(); // Total for 2 tickets
    expect(screen.getAllByText("₹3.00")).toHaveLength(2); // Individual and total for 1 ticket
  });

  it("should display 'no bookings' message when the user has no tickets", async () => {
    // Mock the supabase calls to return empty ticket data
    (supabase.from as Mock).mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { user_id: 1 },
                error: null,
              }),
            }),
          }),
        };
      } else if (table === "tickets") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        };
      }

      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      };
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
    // Mock the supabase calls to return an error on user lookup
    (supabase.from as Mock).mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "User not found" },
              }),
            }),
          }),
        };
      }

      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      };
    });

    render(
      <MemoryRouter>
        <MyBookingsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Error Loading Bookings")).toBeInTheDocument();
      expect(
        screen.getByText(/Unable to fetch user profile/)
      ).toBeInTheDocument();
    });
  });
});
