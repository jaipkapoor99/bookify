import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import MyBookingsPage from "@/pages/MyBookingsPage";
import { AuthProvider } from "@/contexts/AuthContext";
import { supabase } from "@/SupabaseClient";
import type { Mock } from "vitest";

const mockBookings = [
  {
    booking_id: 1,
    event_name: "Rock Concert",
    event_start_time: "2024-09-15T20:00:00Z",
    venue_name: "The Grand Arena",
  },
  {
    booking_id: 2,
    event_name: "Art Expo",
    event_start_time: "2024-10-20T10:00:00Z",
    venue_name: "City Gallery",
  },
];

describe("MyBookingsPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should render loading state and then display user's bookings", async () => {
    (supabase.rpc as Mock).mockResolvedValue({
      data: mockBookings,
      error: null,
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <MyBookingsPage />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /My Bookings/i })
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Rock Concert")).toBeInTheDocument();
    expect(screen.getByText("Art Expo")).toBeInTheDocument();
  });

  it("should display a message when the user has no bookings", async () => {
    (supabase.rpc as Mock).mockResolvedValue({ data: [], error: null });

    render(
      <MemoryRouter>
        <AuthProvider>
          <MyBookingsPage />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/You have no bookings yet./i)
      ).toBeInTheDocument();
    });
  });

  it("should display an error message if fetching bookings fails", async () => {
    const errorMessage = "Failed to fetch bookings";
    (supabase.rpc as Mock).mockResolvedValue({
      data: null,
      error: { message: errorMessage },
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <MyBookingsPage />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });
});
