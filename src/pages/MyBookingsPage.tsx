import { useState, useEffect } from "react";
import { supabase } from "@/SupabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { Ticket, EventVenue, Event, Venue } from "@/types/database.types";
import { PageLoader } from "@/components/ui/PageLoader";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Ticket as TicketIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type BookingWithDetails = Ticket & {
  events_venues: EventVenue & {
    events: Event;
    venues: Venue;
  };
};

const MyBookingsPage = () => {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!profile) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("tickets")
          .select(
            `
            *,
            events_venues!inner (
              *,
              events!inner (*),
              venues!inner (*)
            )
          `,
          )
          .eq("customer_id", profile.user_id);

        if (error) throw error;
        setBookings(data || []);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        toast.error("Failed to fetch bookings", {
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [profile]);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      {bookings.length === 0 ? (
        <p>You have no bookings.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <Card key={booking.ticket_id}>
              <CardHeader>
                <CardTitle>{booking.events_venues.events.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {booking.events_venues.venues.venue_name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {new Date(booking.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TicketIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {booking.quantity} ticket(s)
                  </span>
                </div>
                <div className="text-lg font-semibold">
                  Total: {formatCurrency(booking.ticket_price * booking.quantity)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;