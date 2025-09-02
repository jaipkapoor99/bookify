import { useState, useEffect } from "react";
import { supabase } from "@/SupabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { Booking } from "@/types/database.types";
import { PageLoader } from "@/components/ui/PageLoader";
import { toast } from "sonner";

const MyBookingsPage = () => {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!profile) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select(
            `
            *,
            events_venues (
              *,
              events (*),
              venues (*)
            )
          `,
          )
          .eq("user_id", profile.user_id);

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
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.booking_id} className="p-4 border rounded-lg">
              <h2 className="text-xl font-semibold">
                {booking.events_venues?.events?.name}
              </h2>
              <p>Venue: {booking.events_venues?.venues?.venue_name}</p>
              <p>Date: {new Date(booking.booking_date).toLocaleDateString()}</p>
              <p>Tickets: {booking.no_of_tickets}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;