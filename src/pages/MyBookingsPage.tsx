import { useEffect, useState } from "react";
import { Calendar, MapPin, Ticket, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/SupabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
// Type for the actual query response from Supabase
type BookingQueryResult = {
  ticket_id: number;
  ticket_price: number;
  created_at: string;
  quantity?: number;
  events_venues?: {
    event_venue_date: string;
    price: number;
    venues?: {
      venue_name: string;
      locations?: {
        pincode: string;
      };
    };
    events?: {
      name: string;
      image_url?: string;
      image_path?: string;
    };
  };
};

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
        setLoading(false);
        return;
      }

      try {
        // First, let's try to check if quantity column exists by using a safer approach
        // We'll query the tickets table using a more flexible select that can handle missing columns
        const { data, error: fetchError } = await supabase.from("tickets")
          .select(`
            ticket_id,
            ticket_price,
            created_at,
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
          `);

        if (fetchError) {
          console.error("Fetch error:", fetchError);
          // If the error is about the quantity column not existing, we'll try without it
          if (fetchError.message?.includes("quantity")) {
            toast.error(
              "Database migration needed: quantity column missing. Contact administrator."
            );
            setError(
              "Database migration needed. Please contact administrator."
            );
          } else {
            setError(`Error fetching bookings: ${fetchError.message}`);
          }
          return;
        }

        // Now try to fetch quantity separately to see if the column exists
        let ticketsWithQuantity: BookingQueryResult[] = [];

        try {
          const { data: quantityData, error: quantityError } = await supabase
            .from("tickets")
            .select("ticket_id, quantity")
            .in("ticket_id", data?.map((t) => t.ticket_id) || []);

          if (!quantityError && quantityData) {
            // Quantity column exists, merge the data
            const quantityMap = new Map(
              quantityData.map((q) => [q.ticket_id, q.quantity])
            );
            ticketsWithQuantity =
              (data as unknown as BookingQueryResult[])?.map((ticket) => ({
                ...ticket,
                quantity: quantityMap.get(ticket.ticket_id) || 1,
              })) || [];
          } else {
            // Quantity column doesn't exist, use default of 1
            ticketsWithQuantity =
              (data as unknown as BookingQueryResult[])?.map((ticket) => ({
                ...ticket,
                quantity: 1,
              })) || [];
          }
        } catch {
          // If there's any error with quantity, just default to 1
          ticketsWithQuantity =
            (data as unknown as BookingQueryResult[])?.map((ticket) => ({
              ...ticket,
              quantity: 1,
            })) || [];
        }

        setTickets(ticketsWithQuantity);

        // Fetch location details for all pincodes since we only have pincode from database
        const pincodes = [
          ...new Set(
            ticketsWithQuantity
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
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
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-red-600 text-lg font-semibold mb-2">
                  Error Loading Bookings
                </div>
                <p className="text-red-700">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="mt-4"
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
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

        {tickets.length === 0 ? (
          <Card className="text-center p-12 bg-white/80 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <Ticket className="h-16 w-16 text-gray-400 mb-4" />
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
          </Card>
        ) : (
          <div className="grid gap-6">
            {tickets.map((ticket) => {
              const event = ticket.events_venues?.events;
              const eventVenue = ticket.events_venues;
              const totalPrice = ticket.ticket_price * (ticket.quantity || 1);

              return (
                <Card
                  key={ticket.ticket_id}
                  className="overflow-hidden hover:shadow-lg transition-shadow bg-white/90 backdrop-blur-sm"
                >
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          {event?.name ?? "Event Name Not Available"}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{getDisplayLocation(ticket)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {eventVenue?.event_venue_date
                                ? formatDate(eventVenue.event_venue_date)
                                : "Date TBD"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="default" className="ml-4">
                        Confirmed
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">
                          Ticket Price
                        </div>
                        <div className="text-lg font-semibold">
                          {formatCurrency(ticket.ticket_price)}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">
                          Quantity
                        </div>
                        <div className="text-lg font-semibold flex items-center gap-2">
                          <Ticket className="h-4 w-4" />
                          {ticket.quantity || 1}{" "}
                          {(ticket.quantity || 1) === 1 ? "ticket" : "tickets"}
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="text-sm text-green-700 mb-1">
                          Total Amount
                        </div>
                        <div className="text-lg font-bold text-green-800">
                          {formatCurrency(totalPrice)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>Booked on {formatDate(ticket.created_at)}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono">#{ticket.ticket_id}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
