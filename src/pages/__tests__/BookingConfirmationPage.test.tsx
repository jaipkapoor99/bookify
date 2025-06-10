/// <reference types="vitest/globals" />
/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import BookingConfirmationPage from "@/pages/BookingConfirmationPage";
import { dbApi } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";

vi.mock("@/contexts/AuthContext");
vi.mock("@/lib/api-client");

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

const mockedDbApi = vi.mocked(dbApi);

describe("BookingConfirmationPage", () => {
  const mockDetails = {
    price: 1500,
    event_venue_date: "2025-10-15T00:00:00",
    no_of_tickets: 50,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    (useAuth as any).mockReturnValue({ user: { id: "user-123" } });

    mockedDbApi.select.mockResolvedValue({
      data: mockDetails,
      error: null,
    });
  });

  it("should display booking details after a successful fetch", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Tech Conference 2025")).toBeInTheDocument();
      expect(screen.getByText("Grand Convention Hall")).toBeInTheDocument();
      expect(screen.getByText("Total Amount:")).toBeInTheDocument();

      // Check for the correctly formatted price.
      // It appears once as "Ticket Price" and once as "Total Amount".
      const priceElements = screen.getAllByText("₹15.00");
      expect(priceElements).toHaveLength(2);
    });
  });

  it("should call the book_ticket RPC and redirect on successful booking", async () => {
    mockedDbApi.rpc.mockResolvedValue({ data: null, error: null });

    renderComponent();

    let bookButton: HTMLElement;
    await waitFor(() => {
      bookButton = screen.getByRole("button", { name: /confirm & book/i });
      expect(bookButton).toBeInTheDocument();
    });

    fireEvent.click(bookButton!);

    await waitFor(() => {
      expect(mockedDbApi.rpc).toHaveBeenCalledWith("book_ticket", {
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
