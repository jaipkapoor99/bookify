/// <reference types="vitest/globals" />
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { MemoryRouter } from "react-router-dom";
import MyBookingsPage from "@/pages/MyBookingsPage";
import { useAuth } from "@/contexts/AuthContext";
import { dbApi } from "@/lib/api-client";
import axios from "axios";

// Mock the API client and axios
vi.mock("@/lib/api-client");
vi.mock("@/contexts/AuthContext");
vi.mock("axios");

const mockedDbApi = vi.mocked(dbApi);
const mockedAxios = vi.mocked(axios);

describe("MyBookingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment variables
    vi.stubEnv("VITE_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "test-anon-key");
  });

  it("should display a loading message initially", () => {
    (useAuth as Mock).mockReturnValue({ user: { id: "user-123" } });

    // Mock dbApi to never resolve (simulate loading)
    mockedDbApi.select.mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <MyBookingsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Loading your bookings...")).toBeInTheDocument();
  });

  it("should display error when user ID is missing", async () => {
    (useAuth as Mock).mockReturnValue({ user: { id: null } });

    render(
      <MemoryRouter>
        <MyBookingsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Error Loading Bookings")).toBeInTheDocument();
      expect(
        screen.getByText(/Authentication error: User ID missing/)
      ).toBeInTheDocument();
    });
  });

  it("should display bookings when data is loaded successfully", async () => {
    const mockUser = { id: "user-123" };
    const mockProfile = { user_id: 1, supabase_id: "user-123" };

    // Mock tickets data in the simplified format (with event_venue_id)
    const mockTickets = [
      {
        ticket_id: 1,
        ticket_price: 500,
        created_at: "2025-11-15T00:00:00Z",
        customer_id: 1,
        quantity: 2,
        event_venue_id: 1,
      },
      {
        ticket_id: 2,
        ticket_price: 300,
        created_at: "2025-11-10T00:00:00Z",
        customer_id: 1,
        quantity: 1,
        event_venue_id: 2,
      },
    ];

    // Mock events_venues data
    const mockEventsVenues = [
      {
        event_venue_id: 1,
        event_venue_date: "2025-11-20",
        price: 500,
        venue_id: 1,
        event_id: 1,
      },
      {
        event_venue_id: 2,
        event_venue_date: "2025-12-05",
        price: 300,
        venue_id: 2,
        event_id: 2,
      },
    ];

    // Mock venues data
    const mockVenues = [
      {
        venue_id: 1,
        venue_name: "City Arena",
        location_id: 1,
      },
      {
        venue_id: 2,
        venue_name: "Community Theater",
        location_id: 2,
      },
    ];

    // Mock events data
    const mockEvents = [
      {
        event_id: 1,
        name: "Rock Fest 2025",
        image_url: "/rock-fest.png",
        image_path: null,
      },
      {
        event_id: 2,
        name: "Winter Gala",
        image_url: "/winter-gala.png",
        image_path: null,
      },
    ];

    // Mock locations data
    const mockLocations = [
      {
        location_id: 1,
        pincode: "110001",
      },
      {
        location_id: 2,
        pincode: "110002",
      },
    ];

    (useAuth as Mock).mockReturnValue({ user: mockUser });

    // Mock all the sequential API calls in order
    mockedDbApi.select
      // 1. Fetch user profile
      .mockResolvedValueOnce({
        data: mockProfile,
        error: null,
      })
      // 2. Fetch tickets
      .mockResolvedValueOnce({
        data: mockTickets,
        error: null,
      })
      // 3. Fetch events_venues (one by one)
      .mockResolvedValueOnce({
        data: mockEventsVenues[0],
        error: null,
      })
      .mockResolvedValueOnce({
        data: mockEventsVenues[1],
        error: null,
      })
      // 4. Fetch venues (one by one)
      .mockResolvedValueOnce({
        data: mockVenues[0],
        error: null,
      })
      .mockResolvedValueOnce({
        data: mockVenues[1],
        error: null,
      })
      // 5. Fetch events (one by one)
      .mockResolvedValueOnce({
        data: mockEvents[0],
        error: null,
      })
      .mockResolvedValueOnce({
        data: mockEvents[1],
        error: null,
      })
      // 6. Fetch locations (one by one)
      .mockResolvedValueOnce({
        data: mockLocations[0],
        error: null,
      })
      .mockResolvedValueOnce({
        data: mockLocations[1],
        error: null,
      });

    // Mock axios for location API calls
    mockedAxios.post = vi
      .fn()
      .mockResolvedValueOnce({
        data: {
          area: "Connaught Place",
          city: "New Delhi",
          state: "Delhi",
        },
      })
      .mockResolvedValueOnce({
        data: {
          area: "Karol Bagh",
          city: "New Delhi",
          state: "Delhi",
        },
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

    // Verify API calls were made correctly
    expect(mockedDbApi.select).toHaveBeenCalledWith(
      "users",
      "user_id,supabase_id",
      { supabase_id: "user-123" },
      { single: true }
    );

    expect(mockedDbApi.select).toHaveBeenCalledWith(
      "tickets",
      expect.stringContaining("ticket_id"),
      { customer_id: 1 }
    );
  });

  it("should display 'no bookings' message when the user has no tickets", async () => {
    const mockUser = { id: "user-123" };
    const mockProfile = { user_id: 1, supabase_id: "user-123" };

    (useAuth as Mock).mockReturnValue({ user: mockUser });

    mockedDbApi.select
      .mockResolvedValueOnce({
        data: mockProfile,
        error: null,
      })
      .mockResolvedValueOnce({
        data: [],
        error: null,
      });

    render(
      <MemoryRouter>
        <MyBookingsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("You have no bookings yet")).toBeInTheDocument();
      expect(
        screen.getByText(/Start exploring events and book your tickets/)
      ).toBeInTheDocument();
    });
  });

  it("should handle profile fetch error", async () => {
    const mockUser = { id: "user-123" };

    (useAuth as Mock).mockReturnValue({ user: mockUser });

    mockedDbApi.select.mockResolvedValueOnce({
      data: null,
      error: "User not found",
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

  it("should handle tickets fetch error", async () => {
    const mockUser = { id: "user-123" };
    const mockProfile = { user_id: 1, supabase_id: "user-123" };

    (useAuth as Mock).mockReturnValue({ user: mockUser });

    mockedDbApi.select
      .mockResolvedValueOnce({
        data: mockProfile,
        error: null,
      })
      .mockResolvedValueOnce({
        data: null,
        error: "Database error",
      });

    render(
      <MemoryRouter>
        <MyBookingsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Error Loading Bookings")).toBeInTheDocument();
      expect(
        screen.getByText(/Error fetching bookings: Database error/)
      ).toBeInTheDocument();
    });
  });

  it("should handle location API errors gracefully", async () => {
    const mockUser = { id: "user-123" };
    const mockProfile = { user_id: 1, supabase_id: "user-123" };

    // Mock tickets data in the simplified format (with event_venue_id)
    const mockTickets = [
      {
        ticket_id: 1,
        ticket_price: 500,
        created_at: "2025-11-15T00:00:00Z",
        customer_id: 1,
        quantity: 1,
        event_venue_id: 1,
      },
    ];

    // Mock related data
    const mockEventVenue = {
      event_venue_id: 1,
      event_venue_date: "2025-11-20",
      price: 500,
      venue_id: 1,
      event_id: 1,
    };

    const mockVenue = {
      venue_id: 1,
      venue_name: "City Arena",
      location_id: 1,
    };

    const mockEvent = {
      event_id: 1,
      name: "Rock Fest 2025",
      image_url: "/rock-fest.png",
      image_path: null,
    };

    const mockLocation = {
      location_id: 1,
      pincode: "110001",
    };

    (useAuth as Mock).mockReturnValue({ user: mockUser });

    // Mock all sequential API calls
    mockedDbApi.select
      .mockResolvedValueOnce({
        data: mockProfile,
        error: null,
      })
      .mockResolvedValueOnce({
        data: mockTickets,
        error: null,
      })
      .mockResolvedValueOnce({
        data: mockEventVenue,
        error: null,
      })
      .mockResolvedValueOnce({
        data: mockVenue,
        error: null,
      })
      .mockResolvedValueOnce({
        data: mockEvent,
        error: null,
      })
      .mockResolvedValueOnce({
        data: mockLocation,
        error: null,
      });

    // Mock axios to throw error for location API
    mockedAxios.post = vi
      .fn()
      .mockRejectedValue(new Error("Location API error"));

    render(
      <MemoryRouter>
        <MyBookingsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Rock Fest 2025")).toBeInTheDocument();
    });

    // Should show pincode fallback when location API fails
    await waitFor(() => {
      expect(screen.getByText("Pincode: 110001")).toBeInTheDocument();
    });
  });

  it("should not render when user is not authenticated", async () => {
    (useAuth as Mock).mockReturnValue({ user: null });

    render(
      <MemoryRouter>
        <MyBookingsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.queryByText("Loading your bookings...")
      ).not.toBeInTheDocument();
      expect(screen.queryByText("My Bookings")).not.toBeInTheDocument();
    });
  });
});
