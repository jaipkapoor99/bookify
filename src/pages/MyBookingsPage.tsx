import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/SupabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { BookingQueryResult } from "@/types/database.types";
import { formatCurrency } from "@/lib/utils";

const MyBookingsPage = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<BookingQueryResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationDetails, setLocationDetails] = useState<
    Record<string, { city: string; area: string; state: string }>
  >({});

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) {
        console.log("No user found - user is null/undefined");
        setLoading(false);
        return;
      }

      if (!user.id) {
        console.error("User object exists but user.id is missing:", user);
        setError(
          "Authentication error: User ID missing. Please log out and log back in."
        );
        setLoading(false);
        return;
      }

      try {
        console.log("Attempting to find user with Supabase ID:", user.id);

        // Try to get existing user profile - only select fields that actually exist
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("user_id, supabase_id")
          .eq("supabase_id", user.id)
          .single();

        console.log(
          "User lookup result - data:",
          userData,
          "error:",
          userError
        );

        // Handle other errors or missing data
        if (userError || !userData) {
          console.error("User lookup error:", userError);
          const errorMessage =
            userError?.code === "PGRST116"
              ? "Your user profile is not set up. Please sign up again or contact support."
              : "Unable to fetch user profile. Please try again later.";
          setError(errorMessage);
          setLoading(false);
          return;
        }

        console.log(
          "Found user ID:",
          userData.user_id,
          "for Supabase ID:",
          user.id
        );

        // Now query tickets for this internal user ID
        const { data, error: fetchError } = await supabase
          .from("tickets")
          .select(
            `
            ticket_id,
            ticket_price,
            created_at,
            customer_id,
            quantity,
            events_venues!events_venues_id (
              event_venue_date,
              price,
              venues!venue_id (
                venue_name,
                locations!location_id (
                  pincode
                )
              ),
              events!event_id (
                name,
                image_url,
                image_path
              )
            )
          `
          )
          .eq("customer_id", userData.user_id);

        if (fetchError) {
          console.error("Fetch error:", fetchError);
          setError(`Error fetching bookings: ${fetchError.message}`);
          setLoading(false);
          return;
        }

        console.log("Raw ticket data:", data);
        console.log("Number of tickets found:", data?.length || 0);

        // Convert to proper type
        const ticketsData: BookingQueryResult[] =
          (data as unknown as BookingQueryResult[]) || [];
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
          const locationPromises = pincodes.map(async (pincode) => {
            try {
              const { data: locationData, error: locationError } =
                await supabase.functions.invoke("get-location-from-pincode", {
                  body: { pincode },
                });

              if (locationError || !locationData) {
                return { pincode, data: null };
              }

              return { pincode, data: locationData };
            } catch (err) {
              console.error(
                `Error fetching location for pincode ${pincode}:`,
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
        console.error("Error fetching bookings:", err);
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
