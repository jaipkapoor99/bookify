/// <reference types="vitest/globals" />
/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import BookingConfirmationPage from "@/pages/BookingConfirmationPage";
import { supabase } from "@/SupabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";

vi.mock("@/hooks/useAuth");

// Mock window.alert
global.alert = vi.fn();

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importActual) => {
  const actual = await importActual<any>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams({ quantity: "1" })],
  };
});

const renderComponent = () =>
  render(
    <MemoryRouter initialEntries={["/book/confirm/1?quantity=1"]}>
      <Routes>
        <Route
          path="/book/confirm/:eventVenueId"
          element={<BookingConfirmationPage />}
        />
        <Route path="/my-bookings" element={<div>My Bookings</div>} />
      </Routes>
      <Toaster />
    </MemoryRouter>
  );

describe("BookingConfirmationPage", () => {
  const mockDetails = {
    price: 1500,
    event_venue_date: "2025-10-15T00:00:00",
    no_of_tickets: 50,
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

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    (useAuth as any).mockReturnValue({ user: { id: "user-123" } });
    (supabase.functions.invoke as Mock).mockResolvedValue({
      data: { area: "Metropolis", city: "NY", state: "NY" },
      error: null,
    });
    (supabase.from as Mock).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockDetails, error: null }),
    });
  });

  it("should display booking details after a successful fetch", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Tech Conference 2025")).toBeInTheDocument();
      expect(screen.getByText("Grand Convention Hall")).toBeInTheDocument();
      expect(screen.getByText("Total Amount:")).toBeInTheDocument();

      // The price appears twice (ticket price and total), so we use getAllByText
      const priceElements = screen.getAllByText("₹1500");
      expect(priceElements).toHaveLength(2);
    });
  });

  it("should call the book_ticket RPC and redirect on successful booking", async () => {
    (supabase.rpc as any).mockResolvedValue({ error: null });

    renderComponent();

    let bookButton: HTMLElement;
    await waitFor(() => {
      bookButton = screen.getByRole("button", { name: /confirm & book/i });
      expect(bookButton).toBeInTheDocument();
    });

    fireEvent.click(bookButton!);

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith("book_ticket", {
        p_event_venue_id: 1,
        p_quantity: 1,
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Booking successful!")).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith("/my-bookings");
      },
      { timeout: 2000 }
    );
  });
});
