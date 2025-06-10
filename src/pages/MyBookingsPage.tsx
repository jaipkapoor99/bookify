import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { BookingQueryResult } from "@/types/database.types";
import { formatCurrency } from "@/lib/utils";
import { dbApi } from "@/lib/api-client";
import axios from "axios";
import {
  TABLES,
  QUERY_COLUMNS,
  COLUMNS,
  ENV_VARS,
  API_ENDPOINTS,
  TIMEOUTS,
  POSTGREST_ERRORS,
} from "@/lib/constants";
import debug from "@/lib/debug";

// Type definitions for the API responses that match database types
interface UserProfile {
  user_id: number;
  supabase_id?: string;
  name?: string;
  role: string;
}

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

const MyBookingsPage = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<BookingQueryResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationDetails, setLocationDetails] = useState<
    Record<string, { city: string; area: string; state: string }>
  >({});

  // Early return if user is not authenticated
  useEffect(() => {
    if (!user) {
      return;
    }
    const fetchTickets = async () => {
      if (!user.id) {
        setError(
          "Authentication error: User ID missing. Please log out and log back in."
        );
        setLoading(false);
        return;
      }

      try {
        // Try to get existing user profile
        const { data: userData, error: userError } = await dbApi.select(
          TABLES.USERS,
          QUERY_COLUMNS.USERS_PROFILE,
          { [COLUMNS.USERS.SUPABASE_ID]: user.id },
          { single: true }
        );

        // Handle errors or missing data
        if (userError || !userData) {
          const errorMessage = userError?.includes(POSTGREST_ERRORS.NO_ROWS)
            ? "Your user profile is not set up. Please sign up again or contact support."
            : "Unable to fetch user profile. Please try again later.";
          setError(errorMessage);
          setLoading(false);
          return;
        }

        const userProfile = userData as UserProfile;

        // Query tickets for this internal user ID (simplified for new API)
        const { data: ticketsRaw, error: fetchError } = await dbApi.select(
          TABLES.TICKETS,
          QUERY_COLUMNS.TICKETS_BASIC,
          { [COLUMNS.TICKETS.CUSTOMER_ID]: userProfile.user_id }
        );

        if (fetchError) {
          setError(`Error fetching bookings: ${fetchError}`);
          setLoading(false);
          return;
        }

        const ticketsArray = (ticketsRaw as TicketRaw[]) || [];

        if (ticketsArray.length === 0) {
          setTickets([]);
          setLoading(false);
          return;
        }

        // Get unique event_venue IDs to fetch related data
        const eventVenueIds = [
          ...new Set(
            ticketsArray.map(
              (t: TicketRaw) => t[COLUMNS.TICKETS.EVENT_VENUE_ID]
            )
          ),
        ];

        // For now, fetch related data one by one since our API doesn't support array filters
        // This is a temporary solution until we enhance the API client
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

        // Fetch venues and events one by one
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

        // Get unique location IDs and fetch locations
        const locationIds = [
          ...new Set(
            venues.map((v: VenueRaw) => v[COLUMNS.VENUES.LOCATION_ID])
          ),
        ];
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

        // Create lookup maps
        const eventsVenuesMap = new Map(
          eventsVenues.map((ev: EventVenueRaw) => [ev.event_venue_id, ev])
        );
        const venuesMap = new Map(venues.map((v: VenueRaw) => [v.venue_id, v]));
        const eventsMap = new Map(events.map((e: EventRaw) => [e.event_id, e]));
        const locationsMap = new Map(
          locations.map((l: LocationRaw) => [l.location_id, l])
        );

        // Transform tickets data to match expected structure
        // Filter out tickets that don't have complete data to avoid null assignments
        const ticketsData: BookingQueryResult[] = ticketsArray
          .map((ticket: TicketRaw): BookingQueryResult | null => {
            const eventVenue = eventsVenuesMap.get(ticket.event_venue_id);
            const venue = eventVenue
              ? venuesMap.get(eventVenue.venue_id)
              : null;
            const event = eventVenue
              ? eventsMap.get(eventVenue.event_id)
              : null;
            const location = venue ? locationsMap.get(venue.location_id) : null;

            // Only process tickets with complete data
            if (!eventVenue) return null;

            return {
              ticket_id: ticket.ticket_id,
              customer_id: ticket.customer_id,
              ticket_price: ticket.ticket_price,
              created_at: ticket.created_at,
              quantity: ticket.quantity,
              events_venues: {
                event_venue_date: eventVenue.event_venue_date,
                price: eventVenue.price,
                no_of_tickets: eventVenue.no_of_tickets,
                venues: venue
                  ? {
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
                    }
                  : undefined,
                events: event
                  ? {
                      name: event.name,
                      description: event.description,
                      image_url: event.image_url,
                      image_path: event.image_path,
                    }
                  : undefined,
              },
            };
          })
          .filter(
            (ticket: BookingQueryResult | null): ticket is BookingQueryResult =>
              ticket !== null
          );

        debug.booking("MyBookingsPage loaded successfully", {
          ticketsRaw: ticketsRaw,
          eventsVenues: eventsVenues,
          venues: venues,
          events: events,
          locations: locations,
          transformedTickets: ticketsData,
        });

        setTickets(ticketsData);

        // Fetch location details for all pincodes
        const pincodes = [
          ...new Set(
            ticketsData
              .map((ticket) => ticket.events_venues?.venues?.locations?.pincode)
              .filter((p): p is string => !!p)
          ),
        ];

        if (pincodes.length > 0) {
          const SUPABASE_URL = import.meta.env[ENV_VARS.SUPABASE_URL];
          const SUPABASE_ANON_KEY = import.meta.env[ENV_VARS.SUPABASE_ANON_KEY];

          const locationPromises = pincodes.map(async (pincode) => {
            try {
              const response = await axios.post(
                `${SUPABASE_URL}${API_ENDPOINTS.FUNCTIONS.GET_LOCATION_FROM_PINCODE}`,
                { pincode },
                {
                  headers: {
                    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                    "Content-Type": "application/json",
                  },
                  timeout: TIMEOUTS.LOCATION_API,
                }
              );

              return { pincode, data: response.data };
            } catch (err) {
              debug.warn(
                `Failed to fetch location for pincode ${pincode}`,
                err
              );
              return { pincode, data: null };
            }
          });

          const locationResults = await Promise.all(locationPromises);
          const newLocationDetails: Record<
            string,
            { city: string; area: string; state: string }
          > = {};

          locationResults.forEach(({ pincode, data }) => {
            if (data) {
              newLocationDetails[pincode] = {
                city: data.city || "Unknown City",
                area: data.area || "Unknown Area",
                state: data.state || "Unknown State",
              };
            }
          });

          setLocationDetails(newLocationDetails);
        }
      } catch (err) {
        setError(
          `Error fetching bookings: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  // Early return if user is not authenticated
  if (!user) {
    return null;
  }

  const getDisplayLocation = (ticket: BookingQueryResult) => {
    const location = ticket.events_venues?.venues?.locations;
    if (!location || !location.pincode) return "Location not available";

    // Use resolved location from API
    const resolved = locationDetails[location.pincode];
    if (resolved) {
      return `${resolved.area}, ${resolved.city}, ${resolved.state}`;
    }

    // Fallback to pincode while location is being fetched
    return `Pincode: ${location.pincode}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">
              Loading your bookings...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
            <div className="text-center">
              <div className="text-red-600 text-lg font-semibold mb-2">
                Error Loading Bookings
              </div>
              <p className="text-red-700">{error}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Bookings
            </h1>
            <p className="text-gray-600">Manage and view your event tickets</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl border shadow-sm p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-xl font-bold text-gray-500 opacity-50">
                  Bookify
                </span>
              </div>
              <svg
                className="h-16 w-16 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                You have no bookings yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start exploring events and book your tickets
              </p>
              <Button onClick={() => (window.location.href = "/")}>
                Browse Events
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage and view your event tickets</p>
        </div>

        <div className="space-y-6">
          {tickets.map((ticket) => (
            <div
              key={ticket.ticket_id}
              className="bg-white/80 backdrop-blur-sm rounded-xl border shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex-shrink-0">
                        <img
                          src={
                            ticket.events_venues?.events?.image_url ||
                            "/placeholder.svg"
                          }
                          alt={ticket.events_venues?.events?.name || "Event"}
                          className="h-16 w-16 rounded-lg object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {ticket.events_venues?.events?.name ||
                            "Unknown Event"}
                        </h3>
                        <p className="text-gray-600">
                          {ticket.events_venues?.venues?.venue_name ||
                            "Unknown Venue"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {getDisplayLocation(ticket)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Event Date:</span>
                        <p className="font-medium">
                          {ticket.events_venues?.event_venue_date
                            ? formatDate(ticket.events_venues.event_venue_date)
                            : "Date not available"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Booking Date:</span>
                        <p className="font-medium">
                          {formatDate(ticket.created_at)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Ticket ID:</span>
                        <p className="font-medium">#{ticket.ticket_id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right ml-6">
                    <div className="mb-2">
                      <span className="text-sm text-gray-500">
                        Price per ticket:
                      </span>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(ticket.ticket_price)}
                      </p>
                    </div>
                    <div className="mb-2">
                      <span className="text-sm text-gray-500">Quantity:</span>
                      <p className="text-lg font-semibold text-gray-900">
                        {ticket.quantity} ticket{ticket.quantity > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Total:</span>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(ticket.ticket_price * ticket.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyBookingsPage;
