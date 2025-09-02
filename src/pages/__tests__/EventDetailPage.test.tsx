import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import EventDetailPage from "@/pages/EventDetailPage";
import { supabase } from "@/SupabaseClient";
import { AuthContext, UserProfile } from "@/contexts/AuthContext";
import { User } from "@supabase/supabase-js";
import { PostgrestError } from "@supabase/postgrest-js";

// Mock the supabase client
vi.mock("@/SupabaseClient", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const mockEvent = {
  event_id: 1,
  name: "Summer Music Fest 2025",
  description: "A fantastic music festival.",
  image_url: "/summer-fest.jpg",
  start_time: "2025-08-01T18:00:00",
  end_time: "2025-08-01T23:00:00",
};

const mockVenues = [
  {
    event_venue_id: 1,
    event_venue_date: "2025-08-01",
    price: 50,
    venues: { venue_name: "Main Stage" },
  },
  {
    event_venue_id: 2,
    event_venue_date: "2025-08-01",
    price: 40,
    venues: { venue_name: "Acoustic Tent" },
  },
];

const renderComponent = (
  user: User | null,
  profile: UserProfile | null = null,
) => {
  return render(
    <AuthContext.Provider
      value={{
        user,
        session: null,
        profile,
        loading: false,
        loginWithGoogle: vi.fn(),
        logout: vi.fn(),
      }}
    >
      <MemoryRouter initialEntries={["/events/1"]}>
        <Routes>
          <Route path="/events/:eventId" element={<EventDetailPage />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
};

describe("EventDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch and display event details including multiple venues", async () => {
    const from = supabase.from as Mock;
    const single = vi.fn().mockResolvedValue({
      data: mockEvent,
      error: null,
      count: 1,
      status: 200,
      statusText: "OK",
    });
    const eq = vi
      .fn()
      .mockReturnValueOnce({ single }) // For the first call to fetch the event
      .mockResolvedValueOnce({
        // For the second call to fetch venues
        data: mockVenues,
        error: null,
        count: 2,
        status: 200,
        statusText: "OK",
      });
    const select = vi.fn().mockReturnValue({ eq });
    from.mockReturnValue({ select });

    renderComponent(null);

    await waitFor(() => {
      expect(screen.getByText(/summer music fest 2025/i)).toBeInTheDocument();
      expect(screen.getByText("Main Stage")).toBeInTheDocument();
      expect(screen.getByText("Acoustic Tent")).toBeInTheDocument();
    });
  });

  it("should display an error message if the event is not found", async () => {
    const from = supabase.from as Mock;
    const mockError: PostgrestError = {
      message: "Not found",
      details: "The requested resource was not found.",
      hint: "Check the event ID.",
      code: "PGRST116",
      name: "",
    };
    const single = vi.fn().mockResolvedValue({
      data: null,
      error: mockError,
      count: null,
      status: 404,
      statusText: "Not Found",
    });
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    from.mockReturnValue({ select });

    renderComponent(null);

    await waitFor(() => {
      expect(screen.getByText("Event not found.")).toBeInTheDocument();
    });
  });
});
