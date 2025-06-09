import { useEffect, useState } from "react";
import { supabase } from "@/SupabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Ticket as TicketIcon, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Corrected & Simplified Type
type Ticket = {
  ticket_id: number;
  ticket_price: number;
  quantity: number;
  created_at: string;
  events_venues: {
    event_venue_date: string;
    venues: {
      venue_name: string;
      locations?: {
        city: string;
      };
    };
    events: {
      name: string;
      image_url: string;
    };
  };
};

const MyBookingsPage = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // New Approach: Call the get_my_bookings RPC function.
      // The function itself is SECURITY DEFINER, ensuring we get the tickets.
      // We then select the nested details needed for display.
      const { data, error: fetchError } = await supabase
        .rpc(
          "get_my_bookings",
          {},
          {
            // The function returns a SETOF tickets, so we need to select from it
            // as if it were a table.
            head: false,
            // We cast the count to 'exact' to get a single value for the count.
            count: "exact",
          }
        )
        .select(
          `
          ticket_id,
          ticket_price,
          quantity,
          created_at,
          events_venues!inner (
            event_venue_date,
            venues!inner (
              venue_name,
              locations (
                city
              )
            ),
            events!inner (
              name,
              image_url
            )
          )
        `
        );

      if (fetchError) {
        setError(fetchError.message);
      } else if (data) {
        setTickets(data as unknown as Ticket[]);
      }

      setLoading(false);
    };

    fetchTickets();
  }, [user]);

  const getTotalAmount = (ticket: Ticket) => {
    return ticket.ticket_price * (ticket.quantity || 1);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        Loading your bookings...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-red-500">
        Error fetching bookings: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">My Bookings</h2>
      {tickets.length === 0 ? (
        <Card className="p-8 text-center">
          <CardContent>
            <TicketIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">You have no bookings yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Browse events and book your tickets to see them here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {tickets.map((ticket) => {
            // Simplified data access
            const eventVenue = ticket.events_venues;
            const event = eventVenue?.events;
            const venue = eventVenue?.venues;
            const quantity = ticket.quantity || 1;

            return (
              <Card
                key={ticket.ticket_id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-48 h-48 md:h-auto">
                    <img
                      src={event?.image_url ?? "/placeholder.png"}
                      alt={event?.name ?? "Event"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">
                          {event?.name ?? "Event Name Not Available"}
                        </h3>
                        <Badge variant="secondary" className="mb-3">
                          Booking ID: {ticket.ticket_id}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="text-2xl font-bold">₹{getTotalAmount(ticket)}</p>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {venue?.venue_name ?? "Venue Not Available"}
                          {venue?.locations?.city && `, ${venue.locations.city}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {eventVenue?.event_venue_date
                            ? new Date(eventVenue.event_venue_date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : "Date Not Available"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <TicketIcon className="h-4 w-4" />
                        <span>
                          {quantity} ticket{quantity > 1 ? 's' : ''} × ₹{ticket.ticket_price} each
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CreditCard className="h-4 w-4" />
                        <span>
                          Booked on {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
