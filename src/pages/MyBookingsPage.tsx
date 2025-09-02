import { useState, useEffect } from "react";
import { supabase } from "@/SupabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { Ticket, EventVenue, Event, Venue } from "@/types/database.types";
import { PageLoader } from "@/components/ui/PageLoader";
import { toast } from "sonner";

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
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.ticket_id} className="p-4 border rounded-lg">
              <h2 className="text-xl font-semibold">
                {booking.events_venues.events.name}
              </h2>
              <p>Venue: {booking.events_venues.venues.venue_name}</p>
              <p>Date: {new Date(booking.created_at).toLocaleDateString()}</p>
              <p>Tickets: {booking.quantity}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
