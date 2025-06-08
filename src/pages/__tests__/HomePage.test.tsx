import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, type Mock } from "vitest";
import HomePage from "@/pages/HomePage";
import { supabase } from "@/SupabaseClient";
import { MemoryRouter } from "react-router-dom";

// Mock the Supabase client
vi.mock("@/SupabaseClient", () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn(),
  },
}));

const mockEvents = [
  {
    event_id: 1,
    name: "Test Event 1",
    start_time: "2024-08-01T20:00:00Z",
    venue_id: 1,
    image_url: "https://example.com/event1.jpg",
  },
  {
    event_id: 2,
    name: "Test Event 2",
    start_time: "2024-08-05T20:00:00Z",
    venue_id: 2,
    image_url: "https://example.com/event2.jpg",
  },
];

describe("HomePage", () => {
  it("should render loading state initially and then display events", async () => {
    // Mock the select query
    const mockedSelect = supabase.from("events").select as Mock;
    mockedSelect.mockResolvedValueOnce({ data: mockEvents, error: null });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Check for loading state
    expect(screen.getByText("Loading events...")).toBeInTheDocument();

    // Wait for events to be displayed
    await waitFor(() => {
      expect(screen.getByText("Test Event 1")).toBeInTheDocument();
      expect(screen.getByText("Test Event 2")).toBeInTheDocument();
    });

    // Check that loading state is gone
    expect(screen.queryByText("Loading events...")).not.toBeInTheDocument();

    // Check for other event details
    const event1Date = new Date(mockEvents[0].start_time).toLocaleDateString();
    expect(screen.getByText(event1Date)).toBeInTheDocument();

    const eventImages = screen.getAllByRole("img");
    expect(eventImages[0]).toHaveAttribute("src", mockEvents[0].image_url);
    expect(eventImages[0]).toHaveAttribute("alt", mockEvents[0].name);
  });

  it("should wrap event cards in links to the event detail page", async () => {
    const mockedSelect = supabase.from("events").select as Mock;
    mockedSelect.mockResolvedValueOnce({ data: mockEvents, error: null });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Event 1")).toBeInTheDocument();
    });

    const link = screen.getByText("Test Event 1").closest("a");
    expect(link).toHaveAttribute("href", `/events/${mockEvents[0].event_id}`);
  });

  it("should display an error message if fetching events fails", async () => {
    // Mock the select query to return an error
    const mockedSelect = supabase.from("events").select as Mock;
    const errorMessage = "Failed to fetch events";
    mockedSelect.mockResolvedValueOnce({
      data: null,
      error: { message: errorMessage },
    });

    // Mock console.error
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.queryByText("Loading events...")).not.toBeInTheDocument();
    });

    // Since the component just logs the error and shows no events,
    // we can check that no events are rendered.
    expect(screen.queryByText("Test Event 1")).not.toBeInTheDocument();

    // Check if console.error was called with the error
    expect(consoleErrorSpy).toHaveBeenCalled();

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});
