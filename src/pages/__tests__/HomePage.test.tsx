import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import HomePage from "@/pages/HomePage";
import { MemoryRouter } from "react-router-dom";
import { supabase } from "@/SupabaseClient";
import type { Mock } from "vitest";

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
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should render loading state initially and then display events", async () => {
    (
      supabase.from("events").select("*").abortSignal as Mock
    ).mockResolvedValueOnce({
      data: mockEvents,
      error: null,
    });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByText("Loading events...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Test Event 1")).toBeInTheDocument();
      expect(screen.getByText("Test Event 2")).toBeInTheDocument();
    });

    expect(screen.queryByText("Loading events...")).not.toBeInTheDocument();

    const event1Date = new Date(mockEvents[0].start_time).toLocaleDateString();
    expect(screen.getByText(event1Date)).toBeInTheDocument();

    const eventImages = screen.getAllByRole("img");
    expect(eventImages[0]).toHaveAttribute("src", mockEvents[0].image_url);
    expect(eventImages[0]).toHaveAttribute("alt", mockEvents[0].name);
  });

  it("should wrap event cards in links to the event detail page", async () => {
    (
      supabase.from("events").select("*").abortSignal as Mock
    ).mockResolvedValueOnce({
      data: mockEvents,
      error: null,
    });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const link = screen.getByText("Test Event 1").closest("a");
      expect(link).toHaveAttribute("href", `/events/${mockEvents[0].event_id}`);
    });
  });

  it("should display a message if fetching events fails", async () => {
    const errorMessage = "Failed to fetch events";
    (
      supabase.from("events").select("*").abortSignal as Mock
    ).mockResolvedValueOnce({
      data: null,
      error: new Error(errorMessage),
    });

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText("Loading events...")).not.toBeInTheDocument();
    });

    expect(screen.queryByText("Test Event 1")).not.toBeInTheDocument();

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
