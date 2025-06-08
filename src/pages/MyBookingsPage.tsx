import { useEffect, useState } from "react";
import { supabase } from "@/SupabaseClient";
import { useAuth } from "@/hooks/useAuth";

type Ticket = {
  ticket_id: number;
  ticket_price: number;
  events_venues:
    | {
        event_venue_date: string;
        venues: { venue_name: string }[] | null;
        events: { name: string; image_url: string }[] | null;
      }[]
    | null;
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

      const { data, error: fetchError } = await supabase.from("tickets")
        .select(`
        ticket_id,
        ticket_price,
        events_venues (
          event_venue_date,
          venues (
            venue_name
          ),
          events (
            name,
            image_url
          )
        )
      `);

      if (fetchError) {
        setError(fetchError.message);
      } else if (data) {
        setTickets(data);
      }

      setLoading(false);
    };

    fetchTickets();
  }, [user]);

  if (loading) {
    return <div>Loading your bookings...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">My Bookings</h2>
      {tickets.length === 0 ? (
        <p>You have no bookings yet.</p>
      ) : (
        <div className="space-y-6">
          {tickets.map((ticket) => {
            const eventVenue = ticket.events_venues?.[0];

            const event = eventVenue?.events?.[0];
            const venue = eventVenue?.venues?.[0];

            const eventName = event?.name ?? "Event Name Not Available";
            const imageUrl = event?.image_url ?? "";
            const venueName = venue?.venue_name ?? "Venue Not Available";
            const eventDate = eventVenue?.event_venue_date
              ? new Date(eventVenue.event_venue_date).toLocaleDateString()
              : "Date Not Available";

            return (
              <div
                key={ticket.ticket_id}
                className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-6"
              >
                <img
                  src={imageUrl}
                  alt={eventName}
                  className="w-32 h-32 object-cover rounded-md"
                />
                <div>
                  <h3 className="text-2xl font-bold">{eventName}</h3>
                  <p className="text-xl text-gray-700">{venueName}</p>
                  <p className="text-lg text-gray-600">{eventDate}</p>
                  <p className="text-lg font-semibold mt-2">
                    Price: ₹{ticket.ticket_price}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
