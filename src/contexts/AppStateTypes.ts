import { Event } from "@/pages/HomePage";

export interface Venue {
  venue_id: number;
  venue_name: string;
  venue_address: string;
  location_id: number;
  created_at: string;
  updated_at: string;
}

export interface EventVenue {
  event_venue_id: number;
  event_id: number;
  venue_id: number;
  no_of_tickets: number;
  event_venue_date: string;
  price: number;
  event?: Event;
  venue?: Venue;
}

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // time to live in milliseconds
}

export interface AppState {
  events: Event[];
  eventVenues: Record<number, EventVenue>;
  venues: Venue[];
  loading: Record<string, boolean>;
  cache: Record<string, CacheItem<unknown>>;
}

export interface AppStateContextType {
  state: AppState;
  fetchEvents: (force?: boolean) => Promise<Event[]>;
  fetchEventVenue: (eventId: number, force?: boolean) => Promise<EventVenue[]>;
  fetchVenues: (force?: boolean) => Promise<Venue[]>;
  clearCache: () => void;
  isLoading: (key: string) => boolean;
}
