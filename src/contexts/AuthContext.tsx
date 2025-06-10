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
}

interface EventVenueRaw {
  event_venue_id: number;
  event_id: number;
  venue_id: number;
  event_venue_date: string;
  price: number;
  no_of_tickets?: number;
}

interface VenueRaw {
  venue_id: number;
  venue_name: string;
  venue_address?: string;
  location_id: number;
}

interface EventRaw {
  event_id: number;
  name: string;
  description?: string;
  image_url?: string;
  image_path?: string;
}

interface LocationRaw {
  location_id: number;
  pincode: string;
  city: string;
  state: string;
  area: string;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const loading = false;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Bookings state
  const [bookings, setBookings] = useState<BookingQueryResult[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
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
            { supabase_id: user.id }
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
      }
    };

    initializeSession();
  }, [fetchProfile]);

  const login = async (
    email: string,
    password: string
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

  // Booking data fetching logic (moved from MyBookingsPage)
  const fetchBookings = useCallback(async (userProfile: UserProfile) => {
    if (!userProfile?.user_id) {
      setBookingsError("User profile not available");
      return;
    }

    setLoadingBookings(true);
    setBookingsError(null);

    try {
      // Query tickets for this internal user ID
      const { data: ticketsRaw, error: fetchError } = await dbApi.select(
        TABLES.TICKETS,
        QUERY_COLUMNS.TICKETS_BASIC,
        { [COLUMNS.TICKETS.CUSTOMER_ID]: userProfile.user_id }
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
          ticketsArray.map((t: TicketRaw) => t[COLUMNS.TICKETS.EVENT_VENUE_ID])
        ),
      ];

      // Fetch related data
      const eventsVenuesPromises = eventVenueIds.map((id) =>
        dbApi.select(
          TABLES.EVENTS_VENUES,
          QUERY_COLUMNS.EVENTS_VENUES_BASIC,
          { [COLUMNS.EVENTS_VENUES.EVENT_VENUE_ID]: id },
          { single: true }
        )
      );

      const eventsVenuesResults = await Promise.all(eventsVenuesPromises);
      const eventsVenues = eventsVenuesResults
        .filter((result) => result.data)
        .map((result) => result.data as EventVenueRaw);

      // Get unique venue and event IDs
      const venueIds = [
        ...new Set(
          eventsVenues.map(
            (ev: EventVenueRaw) => ev[COLUMNS.EVENTS_VENUES.VENUE_ID]
          )
        ),
      ];
      const eventIds = [
        ...new Set(
          eventsVenues.map(
            (ev: EventVenueRaw) => ev[COLUMNS.EVENTS_VENUES.EVENT_ID]
          )
        ),
      ];

      // Fetch venues and events
      const venuesPromises = venueIds.map((id) =>
        dbApi.select(
          TABLES.VENUES,
          QUERY_COLUMNS.VENUES_BASIC,
          { [COLUMNS.VENUES.VENUE_ID]: id },
          { single: true }
        )
      );
      const eventsPromises = eventIds.map((id) =>
        dbApi.select(
          TABLES.EVENTS,
          QUERY_COLUMNS.EVENTS_BASIC,
          { [COLUMNS.EVENTS.EVENT_ID]: id },
          { single: true }
        )
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
          { single: true }
        )
      );

      const locationsResults = await Promise.all(locationsPromises);
      const locations = locationsResults
        .filter((result) => result.data)
        .map((result) => result.data as LocationRaw);

      // Build the tickets data structure
      const ticketsData: BookingQueryResult[] = ticketsArray
        .map((ticket: TicketRaw): BookingQueryResult | null => {
          const eventVenue = eventsVenues.find(
            (ev) => ev.event_venue_id === ticket.event_venue_id
          );
          if (!eventVenue) return null;

          const venue = venues.find((v) => v.venue_id === eventVenue.venue_id);
          if (!venue) return null;

          const event = events.find((e) => e.event_id === eventVenue.event_id);
          if (!event) return null;

          const location = locations.find(
            (l) => l.location_id === venue.location_id
          );

          return {
            ticket_id: ticket.ticket_id,
            ticket_price: ticket.ticket_price,
            created_at: ticket.created_at,
            customer_id: ticket.customer_id,
            quantity: ticket.quantity || 1,
            events_venues: {
              event_venue_date: eventVenue.event_venue_date,
              price: eventVenue.price,
              no_of_tickets: eventVenue.no_of_tickets,
              venues: {
                venue_name: venue.venue_name,
                venue_address: venue.venue_address,
                locations: location
                  ? {
                      pincode: location.pincode,
                      city: location.city,
                      state: location.state,
                      area: location.area,
                    }
                  : undefined,
              },
              events: {
                name: event.name,
                description: event.description,
                image_url: event.image_url,
                image_path: event.image_path,
              },
            },
          };
        })
        .filter(
          (ticket: BookingQueryResult | null): ticket is BookingQueryResult =>
            ticket !== null
        );

      setBookings(ticketsData);

      // Fetch location details for display
      const locationDetailsMap: Record<
        string,
        { city: string; area: string; state: string }
      > = {};

      for (const ticket of ticketsData) {
        const locationData = ticket.events_venues.venues?.locations;
        if (locationData) {
          try {
            const response = await axios.post(
              `${process.env.VITE_SUPABASE_URL}${API_ENDPOINTS.FUNCTIONS.GET_LOCATION_FROM_PINCODE}`,
              { pincode: locationData.pincode }
            );
            locationDetailsMap[locationData.pincode] = response.data;
          } catch {
            // Fallback to database location data
            locationDetailsMap[locationData.pincode] = {
              city: locationData.city,
              area: locationData.area,
              state: locationData.state,
            };
          }
        }
      }

      setLocationDetails(locationDetailsMap);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch bookings";
      setBookingsError(errorMessage);
      debug.error("Bookings fetch error", error);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
// eslint-disable-next-line react-refresh/only-export-components
export { useAuth } from "./AuthContext.context";
