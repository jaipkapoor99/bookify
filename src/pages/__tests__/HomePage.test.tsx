import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import { useAppState } from "@/hooks/useAppState";
import { AppState } from "@/contexts/AppStateContext";
import React from "react";
import { Event } from "@/types/database.types";

// Mock the useAppState hook
vi.mock("@/hooks/useAppState");

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

const mockedUseAppState = vi.mocked(useAppState);

// Helper function to create a complete AppState object
const createMockAppState = (partialState: Partial<AppState>): AppState => ({
  events: [],
  eventVenues: {},
  venues: [],
  loading: {},
  ...partialState,
});

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display events when they are fetched successfully", async () => {
    const mockEvents: Event[] = [
      {
        event_id: 1,
        name: "Rock Concert",
        start_time: "2025-06-21T18:00:00",
        end_time: "2025-06-21T22:00:00",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        image_url: "/rock-concert.jpg",
        events_venues: [
          {
            venues: {
              venue_name: "Rock Arena",
              locations: { pincode: "110001" },
            },
          },
        ],
      },
      {
        event_id: 2,
        name: "Jazz Night",
        start_time: "2025-06-25T20:00:00",
        end_time: "2025-06-25T22:00:00",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        image_url: "/jazz-night.jpg",
        events_venues: [
          {
            venues: {
              venue_name: "Jazz Club",
              locations: { pincode: "110002" },
            },
          },
        ],
      },
    ];

    mockedUseAppState.mockReturnValue({
      state: createMockAppState({ events: mockEvents }),
      fetchEvents: vi.fn(),
      fetchEventVenue: vi.fn(),
      fetchVenues: vi.fn(),
      isLoading: vi.fn().mockReturnValue(false),
    });

    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("Rock Concert")).toBeInTheDocument();
      expect(screen.getByText("Jazz Night")).toBeInTheDocument();
    });
  });

  it("should wrap event cards in links to the event detail page", async () => {
    const mockEvents: Event[] = [
      {
        event_id: 1,
        name: "Rock Concert",
        start_time: "2025-06-21T18:00:00",
        end_time: "2025-06-21T22:00:00",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        image_url: "/rock-concert.jpg",
        events_venues: [
          {
            venues: {
              venue_name: "Rock Arena",
              locations: { pincode: "110001" },
            },
          },
        ],
      },
    ];

    mockedUseAppState.mockReturnValue({
      state: createMockAppState({ events: mockEvents }),
      fetchEvents: vi.fn(),
      fetchEventVenue: vi.fn(),
      fetchVenues: vi.fn(),
      isLoading: vi.fn().mockReturnValue(false),
    });

    renderWithProviders(<HomePage />);

    await waitFor(() => {
      const links = screen.getAllByRole("link", { name: /view details/i });
      expect(links[0]).toHaveAttribute("href", "/events/1");
    });
  });

  it("should display a message if no events are available", async () => {
    mockedUseAppState.mockReturnValue({
      state: createMockAppState({ events: [] }),
      fetchEvents: vi.fn(),
      fetchEventVenue: vi.fn(),
      fetchVenues: vi.fn(),
      isLoading: vi.fn().mockReturnValue(false),
    });

    renderWithProviders(<HomePage />);

    await waitFor(() => {
      // There are multiple "No events found" texts, so use getAllByText and check the heading one
      const noEventsTexts = screen.getAllByText("No events found");
      expect(noEventsTexts.length).toBeGreaterThan(0);
      expect(noEventsTexts[0]).toBeInTheDocument();
    });
  });
});
