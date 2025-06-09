import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Event } from "@/pages/HomePage";
import { supabase } from "@/SupabaseClient";
import { toast } from "sonner";

interface Venue {
  venue_id: number;
  venue_name: string;
  venue_address: string;
  location_id: number;
  created_at: string;
  updated_at: string;
}

interface EventVenue {
  event_venue_id: number;
  event_id: number;
  venue_id: number;
  no_of_tickets: number;
  event_venue_date: string;
  price: number;
  event?: Event;
  venue?: Venue;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // time to live in milliseconds
}

interface AppState {
  events: Event[];
  eventVenues: Record<number, EventVenue>;
  venues: Venue[];
  loading: Record<string, boolean>;
  cache: Record<string, CacheItem<unknown>>;
}

interface AppStateContextType {
  state: AppState;
  fetchEvents: (force?: boolean) => Promise<Event[]>;
  fetchEventVenue: (eventId: number, force?: boolean) => Promise<EventVenue[]>;
  fetchVenues: (force?: boolean) => Promise<Venue[]>;
  clearCache: () => void;
  isLoading: (key: string) => boolean;
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined
);

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};

export const AppStateProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AppState>({
    events: [],
    eventVenues: {},
    venues: [],
    loading: {},
    cache: {},
  });

  const setLoading = (key: string, isLoading: boolean) => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, [key]: isLoading },
    }));
  };

  const isLoading = (key: string) => state.loading[key] || false;

  const isCacheValid = <T,>(key: string): { valid: boolean; data?: T } => {
    const cached = state.cache[key];
    if (!cached) return { valid: false };

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      // Cache expired
      return { valid: false };
    }

    return { valid: true, data: cached.data as T };
  };

  const setCache = <T,>(key: string, data: T, ttl: number = DEFAULT_TTL) => {
    setState((prev) => ({
      ...prev,
      cache: {
        ...prev.cache,
        [key]: {
          data,
          timestamp: Date.now(),
          ttl,
        },
      },
    }));
  };

  const fetchEvents = useCallback(async (force = false): Promise<Event[]> => {
    const cacheKey = "events";

    if (!force) {
      const cached = isCacheValid<Event[]>(cacheKey);
      if (cached.valid && cached.data) {
        return cached.data;
      }
    }

    setLoading(cacheKey, true);

    try {
      const { data, error } = await supabase
        .from("events")
        .select(
          `
          *,
          events_venues (
            venues (
              name,
              city
            )
          )
        `
        )
        .order("start_time", { ascending: true });

      if (error) {
        toast.error("Failed to fetch events", {
          description: error.message,
        });
        throw error;
      }

      const events = data as Event[];

      setState((prev) => ({
        ...prev,
        events,
      }));

      setCache(cacheKey, events);

      return events;
    } catch (error) {
      console.error("Error fetching events:", error);
      return [];
    } finally {
      setLoading(cacheKey, false);
    }
  }, []);

  const fetchEventVenue = useCallback(
    async (eventId: number, force = false): Promise<EventVenue[]> => {
      const cacheKey = `event-venues-${eventId}`;

      if (!force) {
        const cached = isCacheValid<EventVenue[]>(cacheKey);
        if (cached.valid && cached.data) {
          return cached.data;
        }
      }

      setLoading(cacheKey, true);

      try {
        const { data, error } = await supabase
          .from("events_venues")
          .select(
            `
          *,
          event:events(*),
          venue:venues(*)
        `
          )
          .eq("event_id", eventId);

        if (error) {
          toast.error("Failed to fetch event venues", {
            description: error.message,
          });
          throw error;
        }

        const eventVenues = data as EventVenue[];

        // Store in state indexed by event_venue_id
        const venuesMap = eventVenues.reduce((acc, ev) => {
          acc[ev.event_venue_id] = ev;
          return acc;
        }, {} as Record<number, EventVenue>);

        setState((prev) => ({
          ...prev,
          eventVenues: { ...prev.eventVenues, ...venuesMap },
        }));

        setCache(cacheKey, eventVenues);

        return eventVenues;
      } catch (error) {
        console.error("Error fetching event venues:", error);
        return [];
      } finally {
        setLoading(cacheKey, false);
      }
    },
    []
  );

  const fetchVenues = useCallback(async (force = false): Promise<Venue[]> => {
    const cacheKey = "venues";

    if (!force) {
      const cached = isCacheValid<Venue[]>(cacheKey);
      if (cached.valid && cached.data) {
        return cached.data;
      }
    }

    setLoading(cacheKey, true);

    try {
      const { data, error } = await supabase
        .from("venues")
        .select("*")
        .order("venue_name");

      if (error) {
        toast.error("Failed to fetch venues", {
          description: error.message,
        });
        throw error;
      }

      const venues = data as Venue[];

      setState((prev) => ({
        ...prev,
        venues,
      }));

      setCache(cacheKey, venues);

      return venues;
    } catch (error) {
      console.error("Error fetching venues:", error);
      return [];
    } finally {
      setLoading(cacheKey, false);
    }
  }, []);

  const clearCache = useCallback(() => {
    setState((prev) => ({
      ...prev,
      cache: {},
    }));
  }, []);

  const value: AppStateContextType = {
    state,
    fetchEvents,
    fetchEventVenue,
    fetchVenues,
    clearCache,
    isLoading,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};
