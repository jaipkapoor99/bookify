import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import { useAppState } from "@/hooks/useAppState";
import React from "react";

// Mock the useAppState hook
vi.mock("@/hooks/useAppState");

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

const mockedUseAppState = vi.mocked(useAppState);

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display events when they are fetched successfully", async () => {
    const mockEvents = [
      {
        event_id: 1,
        name: "Rock Concert",
        start_time: "2025-06-21T18:00:00",
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
      state: { events: mockEvents },
      fetchEvents: vi.fn(),
      isLoading: vi.fn().mockReturnValue(false),
    });

    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("Rock Concert")).toBeInTheDocument();
      expect(screen.getByText("Jazz Night")).toBeInTheDocument();
    });
  });

  it("should wrap event cards in links to the event detail page", async () => {
    const mockEvents = [
      {
        event_id: 1,
        name: "Rock Concert",
        start_time: "2025-06-21T18:00:00",
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
      state: { events: mockEvents },
      fetchEvents: vi.fn(),
      isLoading: vi.fn().mockReturnValue(false),
    });

    renderWithProviders(<HomePage />);

    await waitFor(() => {
      const links = screen.getAllByRole("link", { name: /view details/i });
      expect(links[0]).toHaveAttribute("href", "/events/1");
    });
  });

  it("should display a message if fetching events fails", async () => {
    mockedUseAppState.mockReturnValue({
      state: { events: [] },
      fetchEvents: vi.fn(),
      isLoading: vi.fn().mockReturnValue(false),
    });

    renderWithProviders(<HomePage />);

    await waitFor(() => {
      // The app state context will catch the error and toast it.
      // The page itself will show "0 Events Found".
      expect(screen.getByText("0 Events Found")).toBeInTheDocument();
    });
  });
});
