import React, { useState, useCallback, ReactNode, useRef } from "react";
import { Event } from "@/pages/HomePage";
import { toast } from "sonner";
import {
  AppStateContextType,
  AppState,
  CacheItem,
  Venue,
  EventVenue,
} from "@/contexts/AppStateTypes";
import { AppStateContext } from "@/contexts/AppStateContext";

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

// Optimized direct fetch utility to bypass hanging Supabase client
const fetchFromSupabase = async (
  table: string,
  query: string,
  filters: string = ""
) => {
  const url = `${
    import.meta.env.VITE_SUPABASE_URL
  }/rest/v1/${table}?select=${encodeURIComponent(query)}${filters}`;

  const response = await fetch(url, {
    headers: {
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY!}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
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

  const cacheRef = useRef<Record<string, CacheItem<unknown>>>({});
  const loadingRef = useRef<Record<string, boolean>>({});

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    if (isLoading) {
      loadingRef.current[key] = true;
    } else {
      delete loadingRef.current[key];
    }
    setState((prev) => {
      const newLoading = { ...prev.loading };
      if (isLoading) {
        newLoading[key] = true;
      } else {
        delete newLoading[key];
      }
      return { ...prev, loading: newLoading };
    });
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingRef.current[key] || false;
  }, []);

  const setCache = useCallback(
    <T,>(key: string, data: T, ttl: number = DEFAULT_TTL) => {
      const cacheItem = { data, timestamp: Date.now(), ttl };
      cacheRef.current[key] = cacheItem;
      setState((prev) => ({
        ...prev,
        cache: { ...prev.cache, [key]: cacheItem },
      }));
    },
    []
  );

  const getCache = useCallback(<T,>(key: string): T | null => {
    const item = cacheRef.current[key];
    if (item && Date.now() - item.timestamp < item.ttl) {
      return item.data as T;
    }
    return null;
  }, []);

  const fetchEvents = useCallback(
    async (force = false): Promise<Event[]> => {
      console.log("🔥 fetchEvents called with force:", force);
      const cacheKey = "events";
      if (!force) {
        const cached = getCache<Event[]>(cacheKey);
        if (cached) {
          console.log("✅ Found cached events:", cached.length);
          return cached;
        }
      }
      console.log("📡 Starting database query using optimized direct fetch...");
      setLoading(cacheKey, true);
      try {
        const query = `event_id,name,description,start_time,end_time,image_url,image_path,events_venues(venues(venue_name,locations(pincode)))`;
        const filters = `&order=start_time.asc`;

        console.log("🔧 Fetching events with optimized query...");
        const data = await fetchFromSupabase("events", query, filters);
        console.log("📡 Optimized fetch response:", {
          dataLength: data?.length,
        });

        console.log("📡 Database response:", {
          dataLength: data?.length,
        });
        const events: Event[] = (data as unknown as Event[]) || [];
        console.log("✅ Successfully processed events:", events.length);
        setCache(cacheKey, events);
        setState((prev) => ({ ...prev, events }));
        return events;
      } catch (error) {
        console.error("❌ Error in fetchEvents:", error);
        if (error instanceof Error) {
          toast.error("Failed to fetch events", {
            description: error.message,
          });
        }
        return [];
      } finally {
        console.log("🏁 Setting loading to false");
        setLoading(cacheKey, false);
      }
    },
    [getCache, setCache, setLoading]
  );

  const fetchEventVenue = useCallback(
    async (eventId: number, force = false): Promise<EventVenue[]> => {
      const cacheKey = `event_venues_${eventId}`;
      if (!force) {
        const cached = getCache<EventVenue[]>(cacheKey);
        if (cached) return cached;
      }
      setLoading(cacheKey, true);
      try {
        const query = `*,venues(*,locations(*))`;
        const filters = `&event_id=eq.${eventId}`;
        const data = await fetchFromSupabase("events_venues", query, filters);
        const eventVenues = data as EventVenue[];
        setCache(cacheKey, eventVenues);

        const venuesMap = eventVenues.reduce((acc, ev) => {
          acc[ev.event_venue_id] = ev;
          return acc;
        }, {} as Record<number, EventVenue>);

        setState((prev) => ({
          ...prev,
          eventVenues: { ...prev.eventVenues, ...venuesMap },
        }));

        return eventVenues;
      } catch (error) {
        if (error instanceof Error)
          toast.error(`Failed to fetch venues for event ${eventId}`, {
            description: error.message,
          });
        return [];
      } finally {
        setLoading(cacheKey, false);
      }
    },
    [getCache, setCache, setLoading]
  );

  const fetchVenues = useCallback(
    async (force = false): Promise<Venue[]> => {
      const cacheKey = "venues";
      if (!force) {
        const cached = getCache<Venue[]>(cacheKey);
        if (cached) return cached;
      }
      setLoading(cacheKey, true);
      try {
        const query = `*,locations(*)`;
        const filters = `&order=venue_name.asc`;
        const data = await fetchFromSupabase("venues", query, filters);
        const venues = data as Venue[];
        setCache(cacheKey, venues);
        setState((prev) => ({ ...prev, venues }));

        return venues;
      } catch (error) {
        if (error instanceof Error)
          toast.error("Failed to fetch venues", {
            description: error.message,
          });
        return [];
      } finally {
        setLoading(cacheKey, false);
      }
    },
    [getCache, setCache, setLoading]
  );

  const clearCache = useCallback(() => {
    cacheRef.current = {};
    setState((prev) => ({ ...prev, cache: {} }));
  }, []);

  const value: AppStateContextType = {
    state,
    isLoading,
    fetchEvents,
    fetchEventVenue,
    fetchVenues,
    clearCache,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};
