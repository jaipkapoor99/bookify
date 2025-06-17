import { useEffect, useState, type ReactNode, useCallback } from "react";
import { AuthContext, type UserProfile } from "./AuthContext.context";
import { authApi, dbApi, type User, type Session } from "@/lib/api-client";
import { BookingQueryResult } from "@/types/database.types";
import {
  STORAGE_KEYS,
  DEFAULTS,
  TABLES,
  QUERY_COLUMNS,
  COLUMNS,
  API_ENDPOINTS,
} from "@/lib/constants";
import axios from "axios";
import debug from "@/lib/debug";

// Type definitions for the API responses that match database types
interface TicketRaw {
  ticket_id: number;
  event_venue_id: number;
  customer_id: number;
  quantity: number;
  ticket_price: number;
  created_at: string;
  updated_at: string;
}

interface EventVenueRaw {
  event_venue_id: number;
  event_id: number;
  venue_id: number;
  event_venue_date: string;
  price: number;
  no_of_tickets: number;
  created_at: string;
  updated_at: string;
}

interface VenueRaw {
  venue_id: number;
  venue_name: string;
  location_id: number;
  created_at: string;
  updated_at: string;
}

interface EventRaw {
  event_id: number;
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  image_url?: string;
  image_path?: string;
  created_at: string;
  updated_at: string;
}

interface LocationRaw {
  location_id: number;
  pincode: string;
  created_at: string;
  updated_at: string;
}

// Interface for the optimized database function result
interface OptimizedBookingResult {
  ticket_id: number;
  customer_id: number;
  event_venue_id: number;
  ticket_price: number;
  quantity: number;
  created_at: string;
  updated_at: string;
  event_venue_date: string;
  event_venue_price: number;
  no_of_tickets: number;
  venue_name: string;
  pincode: string;
  event_name: string;
  event_description: string;
  event_start_time: string;
  event_end_time: string;
  event_image_url: string;
  event_image_path: string;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // Start as loading during initialization
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Bookings state
  const [bookings, setBookings] = useState<BookingQueryResult[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  // Location details fetched from external API based on pincode
  const [locationDetails, setLocationDetails] = useState<
    Record<string, { city: string; area: string; state: string }>
  >({});

  const fetchProfile = useCallback(async (user: User | null) => {
    if (!user) {
      setProfile(null);
      return;
    }

    if (!user.id) {
      console.error("User ID is missing:", user);
      setProfile(null);
      return;
    }

    setLoadingProfile(true);

    try {
      // First, try to get existing profile (without single: true to avoid 406 errors)
      const { data, error } = await dbApi.select<UserProfile>("users", "*", {
        supabase_id: user.id,
      });

      if (data && Array.isArray(data) && data.length > 0) {
        // Profile exists, use the first one
        setProfile(data[0]);
      } else if (
        !data ||
        (Array.isArray(data) && data.length === 0) ||
        error?.includes("PGRST116") ||
        error?.includes("no rows")
      ) {
        // Profile doesn't exist, create it for OAuth users
        debug.auth("Creating new user profile for OAuth user", {
          userId: user.id,
        });

        const newProfile = {
          supabase_id: user.id,
          name:
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            DEFAULTS.USER_NAME,
          created_at: new Date().toISOString(),
        };

        const createResult = await dbApi.insert("users", newProfile);
        const createError = createResult?.error;

        if (createError) {
          console.warn("Failed to create user profile:", createError);
          setProfile(null);
        } else {
          debug.success("Successfully created user profile");
          // Fetch the created profile
          const { data: fetchedProfile } = await dbApi.select<UserProfile>(
            "users",
            "*",
            { supabase_id: user.id },
          );
          if (
            fetchedProfile &&
            Array.isArray(fetchedProfile) &&
            fetchedProfile.length > 0
          ) {
            setProfile(fetchedProfile[0]);
          } else {
            setProfile(null);
          }
        }
      } else {
        console.warn("Profile fetch error:", error);
        setProfile(null);
      }
    } catch (error) {
      console.warn("Profile fetch exception:", error);
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const { data: session, error } = await authApi.getSession();

        if (error) {
          debug.error("Session initialization error", error);
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false); // Initialization complete
          return;
        }

        if (session) {
          debug.auth("Initializing with session", {
            hasToken: !!session.access_token,
            userId: session.user?.id,
            fullUser: session.user,
          });

          // Validate that user has required fields
          if (!session.user?.id) {
            debug.error("Session user missing ID, clearing corrupted session");
            // Clear corrupted session
            localStorage.removeItem(STORAGE_KEYS.SESSION);
            setSession(null);
            setUser(null);
            setProfile(null);
            setLoading(false); // Initialization complete
            return;
          }

          // Check if session is expired (additional validation)
          // Only check expiry if expires_in looks like a timestamp (> 1 billion = after year 2001)
          const now = Math.floor(Date.now() / 1000);
          const isTimestamp = session.expires_in > 1000000000; // 1 billion seconds

          if (isTimestamp && now >= session.expires_in) {
            debug.error("Session expired, clearing session");
            localStorage.removeItem(STORAGE_KEYS.SESSION);
            setSession(null);
            setUser(null);
            setProfile(null);
            setLoading(false); // Initialization complete
            return;
          }

          // Ensure auth token is set before making database calls
          const { setAuthToken } = await import("@/lib/api-client");
          setAuthToken(session.access_token);

          setSession(session);
          setUser(session.user);
          await fetchProfile(session.user);
        } else {
          console.log("AuthContext: No session found");
        }
      } catch (error) {
        console.warn("Session initialization exception:", error);
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false); // Ensure loading is always set to false when initialization completes
      }
    };

    initializeSession();
  }, [fetchProfile]);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ error: string | null }> => {
    try {
      const { data, error } = await authApi.signIn(email, password);

      if (error) {
        return { error };
      }

      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
        await fetchProfile(data.session.user);
      }

      return { error: null };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      return { error: errorMessage };
    }
  };

  const logout = async (): Promise<{ error: string | null }> => {
    try {
      const { error } = await authApi.signOut();

      // Clear state regardless of API response
      setSession(null);
      setUser(null);
      setProfile(null);
      // Clear bookings data
      setBookings([]);
      setBookingsError(null);
      setLocationDetails({});

      return { error };
    } catch (error: unknown) {
      // Clear state even if logout API fails
      setSession(null);
      setUser(null);
      setProfile(null);
      setBookings([]);
      setBookingsError(null);
      setLocationDetails({});
      const errorMessage =
        error instanceof Error ? error.message : "Logout failed";
      return { error: errorMessage };
    }
  };

  const loginWithGoogle = async (): Promise<{ error: string | null }> => {
    try {
      const { data, error } = await authApi.signInWithGoogle();

      if (error) {
        return { error };
      }

      if (data?.url) {
        // Redirect to Google OAuth URL
        window.location.href = data.url;
      }

      return { error: null };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Google login failed";
      return { error: errorMessage };
    }
  };

  // OPTIMIZATION 3: Batch location fetching with caching and timeout protection
  const fetchLocationDetailsBatch = useCallback(
    async (bookingsData: BookingQueryResult[]) => {
      const locationDetailsMap: Record<
        string,
        { city: string; area: string; state: string }
      > = { ...locationDetails }; // Start with existing cache

      // Get unique pincodes that aren't already cached
      const uniquePincodes = [
        ...new Set(
          bookingsData
            .map((ticket) => ticket.events_venues?.venues?.locations?.pincode)
            .filter(
              (pincode): pincode is string =>
                pincode !== undefined && !locationDetailsMap[pincode],
            ),
        ),
      ];

      if (uniquePincodes.length === 0) {
        return; // All pincodes already cached
      }

      // OPTIMIZATION 4: Parallel requests with individual timeout handling
      const locationPromises = uniquePincodes.map(async (pincode) => {
        try {
          const response = await Promise.race([
            axios.post(
              `${import.meta.env.VITE_SUPABASE_URL}${
                API_ENDPOINTS.FUNCTIONS.GET_LOCATION_FROM_PINCODE
              }`,
              { pincode },
              {
                headers: {
                  Authorization: `Bearer ${
                    import.meta.env.VITE_SUPABASE_ANON_KEY
                  }`,
                  "Content-Type": "application/json",
                },
              },
            ),
            // 3-second timeout per request instead of 10 seconds
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Timeout")), 3000),
            ),
          ]);

          return {
            pincode,
            data: (
              response as {
                data: { city: string; area: string; state: string };
              }
            ).data,
          };
        } catch (error) {
          debug.warn(`Failed to fetch location for pincode ${pincode}:`, error);
          return { pincode, data: null };
        }
      });

      // Execute all location requests in parallel
      const locationResults = await Promise.all(locationPromises);

      // Update cache with successful results
      locationResults.forEach(({ pincode, data }) => {
        if (data) {
          locationDetailsMap[pincode] = data;
        }
      });

      setLocationDetails(locationDetailsMap);
    },
    [locationDetails],
  );

  // Fallback manual fetch (existing logic as backup)
  const fetchBookingsManual = useCallback(
    async (userProfile: UserProfile) => {
      // Query tickets for this internal user ID
      const { data: ticketsRaw, error: fetchError } = await dbApi.select(
        TABLES.TICKETS,
        QUERY_COLUMNS.TICKETS_BASIC,
        { [COLUMNS.TICKETS.CUSTOMER_ID]: userProfile.user_id },
      );

      if (fetchError) {
        setBookingsError(`Error fetching bookings: ${fetchError}`);
        return;
      }

      const ticketsArray = (ticketsRaw as TicketRaw[]) || [];

      if (ticketsArray.length === 0) {
        setBookings([]);
        return;
      }

      // Get unique event_venue IDs to fetch related data
      const eventVenueIds = [
        ...new Set(
          ticketsArray.map((t: TicketRaw) => t[COLUMNS.TICKETS.EVENT_VENUE_ID]),
        ),
      ];

      // Fetch related data
      const eventsVenuesPromises = eventVenueIds.map((id) =>
        dbApi.select(
          TABLES.EVENTS_VENUES,
          QUERY_COLUMNS.EVENTS_VENUES_BASIC,
          { [COLUMNS.EVENTS_VENUES.EVENT_VENUE_ID]: id },
          { single: true },
        ),
      );

      const eventsVenuesResults = await Promise.all(eventsVenuesPromises);
      const eventsVenues = eventsVenuesResults
        .filter((result) => result.data)
        .map((result) => result.data as EventVenueRaw);

      // Get unique venue and event IDs
      const venueIds = [
        ...new Set(
          eventsVenues.map(
            (ev: EventVenueRaw) => ev[COLUMNS.EVENTS_VENUES.VENUE_ID],
          ),
        ),
      ];
      const eventIds = [
        ...new Set(
          eventsVenues.map(
            (ev: EventVenueRaw) => ev[COLUMNS.EVENTS_VENUES.EVENT_ID],
          ),
        ),
      ];

      // Fetch venues and events
      const venuesPromises = venueIds.map((id) =>
        dbApi.select(
          TABLES.VENUES,
          QUERY_COLUMNS.VENUES_BASIC,
          { [COLUMNS.VENUES.VENUE_ID]: id },
          { single: true },
        ),
      );
      const eventsPromises = eventIds.map((id) =>
        dbApi.select(
          TABLES.EVENTS,
          QUERY_COLUMNS.EVENTS_BASIC,
          { [COLUMNS.EVENTS.EVENT_ID]: id },
          { single: true },
        ),
      );

      const [venuesResults, eventsResults] = await Promise.all([
        Promise.all(venuesPromises),
        Promise.all(eventsPromises),
      ]);

      const venues = venuesResults
        .filter((result) => result.data)
        .map((result) => result.data as VenueRaw);
      const events = eventsResults
        .filter((result) => result.data)
        .map((result) => result.data as EventRaw);

      // Get unique location IDs for venues
      const locationIds = [
        ...new Set(venues.map((v: VenueRaw) => v[COLUMNS.VENUES.LOCATION_ID])),
      ];

      // Fetch locations
      const locationsPromises = locationIds.map((id) =>
        dbApi.select(
          TABLES.LOCATIONS,
          QUERY_COLUMNS.LOCATIONS_BASIC,
          { [COLUMNS.LOCATIONS.LOCATION_ID]: id },
          { single: true },
        ),
      );

      const locationsResults = await Promise.all(locationsPromises);
      const locations = locationsResults
        .filter((result) => result.data)
        .map((result) => result.data as LocationRaw);

      // Build the tickets data structure
      const ticketsData: BookingQueryResult[] = ticketsArray
        .map((ticket: TicketRaw): BookingQueryResult | null => {
          const eventVenue = eventsVenues.find(
            (ev) => ev.event_venue_id === ticket.event_venue_id,
          );
          if (!eventVenue) return null;

          const venue = venues.find((v) => v.venue_id === eventVenue.venue_id);
          if (!venue) return null;

          const event = events.find((e) => e.event_id === eventVenue.event_id);
          if (!event) return null;

          const location = locations.find(
            (l) => l.location_id === venue.location_id,
          );

          return {
            ticket_id: ticket.ticket_id,
            customer_id: ticket.customer_id,
            event_venue_id: ticket.event_venue_id,
            ticket_price: ticket.ticket_price,
            quantity: ticket.quantity || 1,
            created_at: ticket.created_at,
            updated_at: ticket.updated_at,
            events_venues: {
              event_venue_date: eventVenue.event_venue_date,
              price: eventVenue.price,
              no_of_tickets: eventVenue.no_of_tickets,
              venues: {
                venue_name: venue.venue_name,
                locations: location
                  ? {
                      pincode: location.pincode,
                    }
                  : undefined,
              },
              events: {
                name: event.name,
                description: event.description,
                start_time: event.start_time,
                end_time: event.end_time,
                image_url: event.image_url,
                image_path: event.image_path,
              },
            },
          };
        })
        .filter(
          (ticket: BookingQueryResult | null): ticket is BookingQueryResult =>
            ticket !== null,
        );

      setBookings(ticketsData);
      await fetchLocationDetailsBatch(ticketsData);
    },
    [fetchLocationDetailsBatch],
  );

  // Booking data fetching logic (optimized to eliminate N+1 queries)
  const fetchBookings = useCallback(
    async (userProfile: UserProfile) => {
      if (!userProfile?.user_id) {
        setBookingsError("User profile not available");
        return;
      }

      setLoadingBookings(true);
      setBookingsError(null);

      try {
        // OPTIMIZATION 1: Use the efficient database function instead of multiple queries
        const { data: ticketsData, error: fetchError } = (await dbApi.rpc(
          "get_my_bookings_with_details",
          { p_customer_id: userProfile.user_id },
        )) as {
          data: OptimizedBookingResult[] | null;
          error: string | null;
        };

        if (fetchError) {
          // Fallback to manual fetch if function doesn't exist
          console.warn(
            "Optimized function not available, falling back to manual fetch",
          );
          await fetchBookingsManual(userProfile);
          return;
        }

        if (!ticketsData || ticketsData.length === 0) {
          setBookings([]);
          setLocationDetails({});
          return;
        }

        // Transform the optimized data
        const bookingsData: BookingQueryResult[] = ticketsData.map(
          (ticket: OptimizedBookingResult) => ({
            ticket_id: ticket.ticket_id,
            customer_id: ticket.customer_id,
            event_venue_id: ticket.event_venue_id,
            ticket_price: ticket.ticket_price,
            quantity: ticket.quantity || 1,
            created_at: ticket.created_at,
            updated_at: ticket.updated_at,
            events_venues: {
              event_venue_date: ticket.event_venue_date,
              price: ticket.event_venue_price,
              no_of_tickets: ticket.no_of_tickets,
              venues: {
                venue_name: ticket.venue_name,
                locations: ticket.pincode
                  ? {
                      pincode: ticket.pincode,
                    }
                  : undefined,
              },
              events: {
                name: ticket.event_name,
                description: ticket.event_description,
                start_time: ticket.event_start_time,
                end_time: ticket.event_end_time,
                image_url: ticket.event_image_url,
                image_path: ticket.event_image_path,
              },
            },
          }),
        );

        setBookings(bookingsData);

        // OPTIMIZATION 2: Batch and cache location details with timeout protection
        await fetchLocationDetailsBatch(bookingsData);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch bookings";
        setBookingsError(errorMessage);
        debug.error("Bookings fetch error", error);
      } finally {
        setLoadingBookings(false);
      }
    },
    [fetchBookingsManual, fetchLocationDetailsBatch],
  );

  // OPTIMIZATION 5: Add optimistic update for new bookings
  const addOptimisticBooking = useCallback(
    (newBookingData: Partial<BookingQueryResult>) => {
      if (!newBookingData.ticket_id) return;

      setBookings((prevBookings) => [
        {
          ...newBookingData,
          ticket_id: newBookingData.ticket_id || 0,
          customer_id: newBookingData.customer_id || 0,
          event_venue_id: newBookingData.event_venue_id || 0,
          ticket_price: newBookingData.ticket_price || 0,
          quantity: newBookingData.quantity || 1,
          created_at: newBookingData.created_at || new Date().toISOString(),
          updated_at: newBookingData.updated_at || new Date().toISOString(),
          events_venues:
            newBookingData.events_venues ||
            ({} as BookingQueryResult["events_venues"]),
        } as BookingQueryResult,
        ...prevBookings,
      ]);
    },
    [],
  );

  const refreshBookings = useCallback(async () => {
    if (profile) {
      await fetchBookings(profile);
    }
  }, [profile, fetchBookings]);

  // Fetch bookings when profile is loaded
  useEffect(() => {
    if (profile && profile.user_id) {
      fetchBookings(profile);
    }
  }, [profile, fetchBookings]);

  const value = {
    user,
    session,
    loading,
    profile,
    loadingProfile,
    login,
    logout,
    loginWithGoogle,
    bookings,
    loadingBookings,
    bookingsError,
    locationDetails,
    refreshBookings,
    addOptimisticBooking,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
// eslint-disable-next-line react-refresh/only-export-components
export { useAuth } from "./AuthContext.context";
