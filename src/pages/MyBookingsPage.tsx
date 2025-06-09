import { useEffect, useState } from "react";
import { supabase } from "@/SupabaseClient";
import { useAuth } from "@/hooks/useAuth";

// Corrected Type: This now matches the structure from the error message.
// events_venues, venues, and events are all treated as arrays.
type Ticket = {
  ticket_id: number;
  ticket_price: number;
  events_venues: {
    event_venue_date: string;
    venues: {
      venue_name: string;
    }[];
    events: {
      name: string;
      image_url: string;
    }[];
  }[];
};

// This type is needed to correctly model the result from our new query
type UserProfileWithTickets = {
  tickets: Ticket[];
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

      // Corrected Query: Remove .single() to handle multiple user profiles
      const { data, error: fetchError } = await supabase
        .from("users")
        .select(
          `
          tickets!customer_id (
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
          )
        `
        )
        .eq("supabase_id", user.id); // This will now return an array of users

      // --- START DEBUG LOGS ---
      console.log("Fetching bookings for user:", user.id);
      console.log("Query data:", data);
      console.log("Query error:", fetchError);
      // --- END DEBUG LOGS ---

      if (fetchError) {
        setError(fetchError.message);
      } else if (data && data.length > 0) {
        // Corrected Logic: Process the result as an array
        // and take the tickets from the first user profile found.
        const userProfile = data[0] as UserProfileWithTickets;
        if (userProfile && userProfile.tickets) {
          console.log("Tickets found for user:", userProfile.tickets); // Log found tickets
          setTickets(userProfile.tickets);
        } else {
          console.log("No tickets found on user profile object."); // Log if tickets property is missing
        }
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
            // This logic correctly and safely accesses the nested data
            // by taking the first element from each nested array.
            const eventVenue = ticket.events_venues?.[0];
            const event = eventVenue?.events?.[0];
            const venue = eventVenue?.venues?.[0];

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
