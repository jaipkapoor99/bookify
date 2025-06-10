import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import EventDetailPage from "@/pages/EventDetailPage";
import { dbApi } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";

// Create a mock navigate function
const mockNavigate = vi.fn();

// Mock necessary components and hooks
vi.mock("react-router-dom", async (importActual) => ({
  ...(await importActual<typeof import("react-router-dom")>()),
  useParams: () => ({ eventId: "1" }),
  useNavigate: () => mockNavigate,
}));

vi.mock("@/lib/api-client");
vi.mock("@/contexts/AuthContext");

const mockEvent = {
  event_id: 1,
  name: "Summer Music Fest 2025",
  description:
    "The biggest outdoor music festival of the year, featuring top artists from around the globe.",
  start_time: "2025-07-15T19:00:00+05:30",
  end_time: "2025-07-15T22:00:00+05:30",
  image_url: "/placeholder.svg",
  events_venues: [
    {
      event_venue_id: 1,
      event_venue_date: new Date().toISOString(),
      no_of_tickets: 100,
      price: 50,
      venues: {
        venue_name: "Grand Convention Center",
        locations: {
          pincode: "110001",
        },
      },
    },
  ],
};

const mockedDbApi = vi.mocked(dbApi);

describe("EventDetailPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Reset the navigation mock
    mockNavigate.mockClear();

    // Mock the API client
    mockedDbApi.select.mockResolvedValue({
      data: mockEvent,
      error: null,
    });
  });

  const renderComponent = (user: { id: string } | null = null) => {
    (useAuth as Mock).mockReturnValue({ user });
    return render(
      <MemoryRouter initialEntries={["/events/1"]}>
        <Routes>
          <Route path="/events/:eventId" element={<EventDetailPage />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it("should fetch and display event details including multiple venues", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Summer Music Fest 2025")).toBeInTheDocument();
      expect(
        screen.getByText(
          "The biggest outdoor music festival of the year, featuring top artists from around the globe."
        )
      ).toBeInTheDocument();
    });

    // Check if the list of venues and dates is rendered
    expect(screen.getByText("Dates and Venues")).toBeInTheDocument();

    // Check venue name
    expect(screen.getByText("Grand Convention Center")).toBeInTheDocument();

    // Check if price is displayed correctly formatted
    expect(screen.getByText("₹0.50")).toBeInTheDocument();

    // Verify the correct API query was made
    expect(mockedDbApi.select).toHaveBeenCalledWith(
      "events",
      "event_id,name,description,image_url,image_path,start_time,end_time",
      { event_id: "1" },
      { single: true }
    );
  });

  it("should open the booking dialog when an authenticated user clicks 'Book Tickets'", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" } as User;

    renderComponent(mockUser);

    await waitFor(() => {
      expect(screen.getByText("Summer Music Fest 2025")).toBeInTheDocument();
    });

    const bookButtons = screen.getAllByText("Book Tickets");
    fireEvent.click(bookButtons[0]); // Click the first "Book Tickets" button

    // Check if the booking dialog appears
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Select Ticket Quantity")).toBeInTheDocument();
    });

    // Check that navigation has NOT been called yet
    expect(mockNavigate).not.toHaveBeenCalled();

    // Check that clicking "Continue to Booking" navigates
    const continueButton = screen.getByRole("button", {
      name: /Continue to Booking/i,
    });
    fireEvent.click(continueButton);

    expect(mockNavigate).toHaveBeenCalledWith(`/book/confirm/1?quantity=1`);
  });

  it("should redirect to login when 'Book Tickets' is clicked by an unauthenticated user", async () => {
    renderComponent(null); // No user is logged in

    await waitFor(() => {
      expect(screen.getByText("Summer Music Fest 2025")).toBeInTheDocument();
    });

    const bookButtons = screen.getAllByRole("button", {
      name: /Book Tickets/i,
    });
    fireEvent.click(bookButtons[0]);

    // Check that navigation to login was called
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("should display an error message if the event is not found", async () => {
    const errorMessage = "Event not found";

    // Override the default mock for this test
    mockedDbApi.select.mockResolvedValue({
      data: null,
      error: errorMessage,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Error: Event not found/i)).toBeInTheDocument();
    });
  });
});
