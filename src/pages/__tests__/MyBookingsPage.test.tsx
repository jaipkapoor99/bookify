import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import MyBookingsPage from "@/pages/MyBookingsPage";
import { AuthContext } from "@/contexts/AuthContext.context";
import { supabase } from "@/SupabaseClient";

const mockUser = { id: "a-mock-user-id" } as User;

const mockTickets = [
  {
    ticket_id: 1,
    ticket_price: 500,
    events_venues: [
      {
        event_venue_date: "2025-10-05",
        venues: [
          {
            venue_name: "NSCI Dome",
          },
        ],
        events: [
          {
            name: "Arijit Singh - Live in Concert",
            image_url: "https://example.com/arijit.jpg",
          },
        ],
      },
    ],
  },
  {
    ticket_id: 2,
    ticket_price: 1200,
    events_venues: [
      {
        event_venue_date: "2026-04-12",
        venues: [
          {
            venue_name: "Wankhede Stadium",
          },
        ],
        events: [
          {
            name: "IPL: Mumbai Indians vs CSK",
            image_url: "https://example.com/ipl.jpg",
          },
        ],
      },
    ],
  },
];

describe("MyBookingsPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const renderComponent = (user: User | null = mockUser) => {
    return render(
      <AuthContext.Provider value={{ user, session: null, loading: false }}>
        <MemoryRouter>
          <MyBookingsPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  it("should render loading state and then display user's bookings", async () => {
    const selectMock = vi
      .fn()
      .mockResolvedValue({ data: mockTickets, error: null });
    vi.spyOn(supabase, "from").mockReturnValue({
      select: selectMock,
    } as unknown as ReturnType<typeof supabase.from>);

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /My Bookings/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText("Arijit Singh - Live in Concert")
      ).toBeInTheDocument();
      expect(screen.getByText("NSCI Dome")).toBeInTheDocument();
      expect(
        screen.getByText("IPL: Mumbai Indians vs CSK")
      ).toBeInTheDocument();
      expect(screen.getByText("Wankhede Stadium")).toBeInTheDocument();
    });

    expect(supabase.from).toHaveBeenCalledWith("tickets");
    expect(selectMock).toHaveBeenCalledWith(
      expect.stringContaining("ticket_id")
    );
    expect(selectMock).toHaveBeenCalledWith(
      expect.stringContaining("events_venues")
    );
    expect(selectMock).toHaveBeenCalledWith(
      expect.stringContaining("venue_name")
    );
    expect(selectMock).toHaveBeenCalledWith(expect.stringContaining("events"));
  });

  it("should display a message when the user has no bookings", async () => {
    const selectMock = vi.fn().mockResolvedValue({ data: [], error: null });
    vi.spyOn(supabase, "from").mockReturnValue({
      select: selectMock,
    } as unknown as ReturnType<typeof supabase.from>);

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(/You have no bookings yet./i)
      ).toBeInTheDocument();
    });
  });

  it("should display an error message if fetching bookings fails", async () => {
    const errorMessage = "Failed to fetch bookings";
    const selectMock = vi.fn().mockResolvedValue({
      data: null,
      error: { message: errorMessage },
    });
    vi.spyOn(supabase, "from").mockReturnValue({
      select: selectMock,
    } as unknown as ReturnType<typeof supabase.from>);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });
});
