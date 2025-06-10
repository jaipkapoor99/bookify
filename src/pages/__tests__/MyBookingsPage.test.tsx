/// <reference types="vitest/globals" />
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import MyBookingsPage from "@/pages/MyBookingsPage";
import { useAuth } from "@/contexts/AuthContext";
import { BookingQueryResult } from "@/types/database.types";
import { User } from "@/lib/api-client";

// Mock the AuthContext
vi.mock("@/contexts/AuthContext");

const mockUseAuth = vi.mocked(useAuth);

// Helper function to create mock user
const createMockUser = (id: string = "user-123"): User => ({
  id,
  email: "test@example.com",
  user_metadata: {},
  app_metadata: {},
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
});

// Helper function to create mock booking data
const createMockBooking = (
  id: number,
  eventName?: string
): BookingQueryResult => ({
  ticket_id: id,
  customer_id: 1,
  event_venue_id: 1,
  ticket_price: 250000, // in cents (₹2500.00)
  quantity: 2,
  created_at: "2025-01-15T10:30:00Z",
  updated_at: "2025-01-15T10:30:00Z",
  events_venues: {
    event_venue_date: "2025-07-15",
    price: 250000, // in cents
    no_of_tickets: 100,
    events: {
      name: eventName || "Summer Music Fest 2025",
      description: "A spectacular summer music festival featuring top artists",
      image_url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea",
      image_path:
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea",
      start_time: "2025-07-15T18:00:00Z",
      end_time: "2025-07-15T23:00:00Z",
    },
    venues: {
      venue_name: "Grand Convention Center",
      locations: {
        pincode: "110001",
      },
    },
  },
});

describe("MyBookingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display loading message when bookings are being loaded", () => {
    mockUseAuth.mockReturnValue({
      user: createMockUser(),
      bookings: [],
      loadingBookings: true,
      bookingsError: null,
      locationDetails: {},
      refreshBookings: vi.fn(),
      // Other AuthContext props
      session: null,
      loading: false,
      profile: null,
      loadingProfile: false,
      login: vi.fn(),
      logout: vi.fn(),
      loginWithGoogle: vi.fn(),
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
      createMockBooking(1, "Summer Music Fest 2025"),
      createMockBooking(2, "Winter Jazz Festival"),
    ];
    const mockLocationDetails = {
      "110001": {
        area: "Connaught Place",
        city: "New Delhi",
        state: "Delhi",
      },
    };

    mockUseAuth.mockReturnValue({
      user: createMockUser(),
      bookings: mockBookings,
      loadingBookings: false,
      bookingsError: null,
      locationDetails: mockLocationDetails,
      refreshBookings: vi.fn(),
      // Other AuthContext props
      session: null,
      loading: false,
      profile: null,
      loadingProfile: false,
      login: vi.fn(),
      logout: vi.fn(),
      loginWithGoogle: vi.fn(),
    });

    render(
      <MemoryRouter>
        <MyBookingsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Summer Music Fest 2025")).toBeInTheDocument();
      expect(screen.getByText("Winter Jazz Festival")).toBeInTheDocument();
      // Check for venue using getAllByText since there are multiple venues
      expect(screen.getAllByText("Grand Convention Center")).toHaveLength(2);
      // Check for location using getAllByText since there are multiple locations
      expect(
        screen.getAllByText("Connaught Place, New Delhi, Delhi")
      ).toHaveLength(2);
    });
  });

  it("should display 'no bookings' message when the user has no tickets", () => {
    mockUseAuth.mockReturnValue({
      user: createMockUser(),
      bookings: [],
      loadingBookings: false,
      bookingsError: null,
      locationDetails: {},
      refreshBookings: vi.fn(),
      // Other AuthContext props
      session: null,
      loading: false,
      profile: null,
      loadingProfile: false,
      login: vi.fn(),
      logout: vi.fn(),
      loginWithGoogle: vi.fn(),
    });

    render(
      <MemoryRouter>
        <MyBookingsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("No bookings found")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You haven't made any bookings yet. Start by browsing our events!"
      )
    ).toBeInTheDocument();
  });

  it("should display error message when there's a bookings error", () => {
    const mockRefreshBookings = vi.fn();
    mockUseAuth.mockReturnValue({
      user: createMockUser(),
      bookings: [],
      loadingBookings: false,
      bookingsError: "Failed to fetch bookings: Network error",
      locationDetails: {},
      refreshBookings: mockRefreshBookings,
      // Other AuthContext props
      session: null,
      loading: false,
      profile: null,
      loadingProfile: false,
      login: vi.fn(),
      logout: vi.fn(),
      loginWithGoogle: vi.fn(),
    });

    render(
      <MemoryRouter>
        <MyBookingsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Error loading bookings")).toBeInTheDocument();
    expect(
      screen.getByText("Failed to fetch bookings: Network error")
    ).toBeInTheDocument();

    // Test the "Try Again" button
    const tryAgainButton = screen.getByText("Try Again");
    expect(tryAgainButton).toBeInTheDocument();

    fireEvent.click(tryAgainButton);
    expect(mockRefreshBookings).toHaveBeenCalledTimes(1);
  });

  it("should handle bookings without complete venue/event information", async () => {
    const incompleteBooking: BookingQueryResult = {
      ticket_id: 1,
      customer_id: 1,
      event_venue_id: 1,
      ticket_price: 150000,
      quantity: 1,
      created_at: "2025-01-15T10:30:00Z",
      updated_at: "2025-01-15T10:30:00Z",
      events_venues: {
        event_venue_date: "2025-08-20",
        price: 150000,
        no_of_tickets: 50,
        // Missing event and venue data to test fallbacks
      },
    };

    mockUseAuth.mockReturnValue({
      user: createMockUser(),
      bookings: [incompleteBooking],
      loadingBookings: false,
      bookingsError: null,
      locationDetails: {},
      refreshBookings: vi.fn(),
      // Other AuthContext props
      session: null,
      loading: false,
      profile: null,
      loadingProfile: false,
      login: vi.fn(),
      logout: vi.fn(),
      loginWithGoogle: vi.fn(),
    });

    render(
      <MemoryRouter>
        <MyBookingsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Event Name Not Available")).toBeInTheDocument();
      expect(screen.getByText("Venue Not Available")).toBeInTheDocument();
      expect(screen.getByText("Location not available")).toBeInTheDocument();
    });
  });

  it("should display correct ticket information including quantity and total price", async () => {
    const mockBooking = createMockBooking(1, "Test Event");

    mockUseAuth.mockReturnValue({
      user: createMockUser(),
      bookings: [mockBooking],
      loadingBookings: false,
      bookingsError: null,
      locationDetails: {
        "110001": {
          area: "Test Area",
          city: "Test City",
          state: "Test State",
        },
      },
      refreshBookings: vi.fn(),
      // Other AuthContext props
      session: null,
      loading: false,
      profile: null,
      loadingProfile: false,
      login: vi.fn(),
      logout: vi.fn(),
      loginWithGoogle: vi.fn(),
    });

    render(
      <MemoryRouter>
        <MyBookingsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Event")).toBeInTheDocument();
      expect(screen.getByText("Grand Convention Center")).toBeInTheDocument();
      expect(
        screen.getByText("Test Area, Test City, Test State")
      ).toBeInTheDocument();
      // Check for quantity display
      expect(screen.getByText("2")).toBeInTheDocument(); // quantity
      // Check for formatted total price - should be ₹5,000.00 (250000 × 2 = 500000 paise)
      expect(screen.getByText("₹5,000.00")).toBeInTheDocument();
    });
  });

  it("should call refreshBookings when refresh button is clicked", () => {
    const mockRefreshBookings = vi.fn();
    mockUseAuth.mockReturnValue({
      user: createMockUser(),
      bookings: [createMockBooking(1)],
      loadingBookings: false,
      bookingsError: null,
      locationDetails: {},
      refreshBookings: mockRefreshBookings,
      // Other AuthContext props
      session: null,
      loading: false,
      profile: null,
      loadingProfile: false,
      login: vi.fn(),
      logout: vi.fn(),
      loginWithGoogle: vi.fn(),
    });

    render(
      <MemoryRouter>
        <MyBookingsPage />
      </MemoryRouter>
    );

    const refreshButton = screen.getByText("Refresh");
    fireEvent.click(refreshButton);

    expect(mockRefreshBookings).toHaveBeenCalledTimes(1);
  });

  it("should show refreshing state when loadingBookings is true", () => {
    mockUseAuth.mockReturnValue({
      user: createMockUser(),
      bookings: [createMockBooking(1)],
      loadingBookings: true,
      bookingsError: null,
      locationDetails: {},
      refreshBookings: vi.fn(),
      // Other AuthContext props
      session: null,
      loading: false,
      profile: null,
      loadingProfile: false,
      login: vi.fn(),
      logout: vi.fn(),
      loginWithGoogle: vi.fn(),
    });

    render(
      <MemoryRouter>
        <MyBookingsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Refreshing...")).toBeInTheDocument();
  });

  it("should prompt user to log in when not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null, // No user
      bookings: [],
      loadingBookings: false,
      bookingsError: null,
      locationDetails: {},
      refreshBookings: vi.fn(),
      // Other AuthContext props
      session: null,
      loading: false,
      profile: null,
      loadingProfile: false,
      login: vi.fn(),
      logout: vi.fn(),
      loginWithGoogle: vi.fn(),
    });

    render(
      <MemoryRouter>
        <MyBookingsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("My Bookings")).toBeInTheDocument();
    expect(
      screen.getByText("Please log in to view your bookings.")
    ).toBeInTheDocument();
  });
});
