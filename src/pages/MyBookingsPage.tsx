import { useEffect, useState } from "react";
import { supabase } from "@/SupabaseClient";
import { useAuth } from "@/hooks/useAuth";

// Corrected & Simplified Type
type Ticket = {
  ticket_id: number;
  ticket_price: number;
  events_venues: {
    event_venue_date: string;
    venues: {
      venue_name: string;
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
          events_venues!inner (
            event_venue_date,
            venues!inner (
              venue_name
            ),
            events!inner (
              name,
              image_url
            )
          )
        `
        );

      // --- START DEBUG LOGS ---
      console.log("Fetching bookings for user:", user.id);
      console.log("Query data:", data);
      console.log("Query error:", fetchError);
      // --- END DEBUG LOGS ---

      if (fetchError) {
        setError(fetchError.message);
      } else if (data) {
        // The RPC call returns the tickets directly, simplifying the logic.
        console.log("Tickets found for user:", data); // Log found tickets
        setTickets(data as unknown as Ticket[]);
      } else {
        console.log("Data is null or empty array."); // Log if data is empty
      }

      setLoading(false);
    };

    fetchTickets();
  }, [user]);

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
        <p>You have no bookings yet.</p>
      ) : (
        <div className="space-y-6">
          {tickets.map((ticket) => {
            // Simplified data access
            const eventVenue = ticket.events_venues;
            const event = eventVenue?.events;
            const venue = eventVenue?.venues;

            return (
              <div
                key={ticket.ticket_id}
                className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-6"
              >
                <img
                  src={event?.image_url ?? "/placeholder.png"}
                  alt={event?.name ?? "Event"}
                  className="w-32 h-32 object-cover rounded-md"
                />
                <div>
                  <h3 className="text-2xl font-bold">
                    {event?.name ?? "Event Name Not Available"}
                  </h3>
                  <p className="text-xl text-gray-700">
                    {venue?.venue_name ?? "Venue Not Available"}
                  </p>
                  <p className="text-lg text-gray-600">
                    {eventVenue?.event_venue_date
                      ? new Date(
                          eventVenue.event_venue_date
                        ).toLocaleDateString()
                      : "Date Not Available"}
                  </p>
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
