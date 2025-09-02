import React, {
  useState,
  useCallback,
  ReactNode,
  createContext,
  useContext,
} from "react";
import { Event, Venue, EventVenue } from "@/types/database.types";
import { supabase } from "@/SupabaseClient";
import { toast } from "sonner";

export interface AppState {
  events: Event[];
  eventVenues: Record<number, EventVenue>;
  venues: Venue[];
  loading: Record<string, boolean>;
}

export interface AppStateContextType {
  state: AppState;
  fetchEvents: (force?: boolean) => Promise<Event[]>;
  fetchEventVenue: (eventId: number, force?: boolean) => Promise<EventVenue[]>;
  fetchVenues: (force?: boolean) => Promise<Venue[]>;
  isLoading: (key: string) => boolean;
}

// 2. CONTEXT CREATION
export const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined,
);

// 3. PROVIDER COMPONENT
export const AppStateProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AppState>({
    events: [],
    eventVenues: {},
    venues: [],
    loading: {},
  });

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, [key]: isLoading },
    }));
  }, []);

  const isLoading = (key: string) => state.loading[key] || false;

  const fetchEvents = useCallback(async (): Promise<Event[]> => {
    const cacheKey = "events";
    setLoading(cacheKey, true);
    try {
      const { data, error } = await supabase
        .from("events")
        .select(
          "event_id,name,description,start_time,end_time,image_url,image_path,events_venues(venues(venue_name,locations(pincode)))",
        )
        .order("start_time", { ascending: true });

      if (error) throw error;

      const events: Event[] = (data as unknown as Event[]) || [];
      setState((prev) => ({ ...prev, events }));
      return events;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error("Failed to fetch events", { description: error.message });
      return [];
    } finally {
      setLoading(cacheKey, false);
    }
  }, [setLoading]);

  const fetchEventVenue = useCallback(
    async (eventId: number): Promise<EventVenue[]> => {
      const cacheKey = `event_venues_${eventId}`;
      setLoading(cacheKey, true);
      try {
        const { data, error } = await supabase
          .from("events_venues")
          .select("*,venues(*,locations(*))")
          .eq("event_id", eventId);

        if (error) throw error;

        const eventVenues = data as EventVenue[];
        const venuesMap = eventVenues.reduce(
          (acc, ev) => {
            acc[ev.event_venue_id] = ev;
            return acc;
          },
          {} as Record<number, EventVenue>,
        );

        setState((prev) => ({
          ...prev,
          eventVenues: { ...prev.eventVenues, ...venuesMap },
        }));

        return eventVenues;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        toast.error(`Failed to fetch venues for event ${eventId}`, {
          description: error.message,
        });
        return [];
      } finally {
        setLoading(cacheKey, false);
      }
    },
    [setLoading],
  );

  const fetchVenues = useCallback(async (): Promise<Venue[]> => {
    const cacheKey = "venues";
    setLoading(cacheKey, true);
    try {
      const { data, error } = await supabase
        .from("venues")
        .select("*,locations(*)")
        .order("venue_name", { ascending: true });

      if (error) throw error;

      const venues = data as Venue[];
      setState((prev) => ({ ...prev, venues }));
      return venues;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error("Failed to fetch venues", { description: error.message });
      return [];
    } finally {
      setLoading(cacheKey, false);
    }
  }, [setLoading]);

  const value: AppStateContextType = {
    state,
    isLoading,
    fetchEvents,
    fetchEventVenue,
    fetchVenues,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

// 4. HOOK FOR CONSUMING CONTEXT
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};
