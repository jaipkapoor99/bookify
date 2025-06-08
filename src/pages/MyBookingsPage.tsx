import { useEffect, useState } from "react";
import { supabase } from "@/SupabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Booking = {
  booking_id: number;
  event_name: string;
  event_start_time: string;
  venue_name: string;
};

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await supabase.rpc("get_my_bookings");

      if (error) {
        setError(`Error: ${error.message}`);
      } else {
        setBookings(data as Booking[]);
      }
      setLoading(false);
    };

    fetchBookings();
  }, []);

  if (loading) {
    return <div>Loading your bookings...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">My Bookings</h2>
      {bookings.length === 0 ? (
        <p>You have no bookings yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <Card key={booking.booking_id} className="overflow-hidden">
              <CardHeader>
                <CardTitle>{booking.event_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(booking.event_start_time).toLocaleDateString()}
                </p>
                <p>
                  <strong>Venue:</strong> {booking.venue_name}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
