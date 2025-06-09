import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/SupabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

// Corrected Type: This now matches the structure from the error message.
interface EventVenue {
  event_venue_id: number;
  event_venue_date: string;
  no_of_tickets: number;
  price: number;
  venues: {
    venue_name: string;
    locations: {
      city: string;
      state: string;
    } | null;
  }; // venues is now an object
}

interface EventDetail {
  event_id: number;
  name: string;
  description: string;
  image_url: string;
  start_time: string;
  end_time: string;
  events_venues: EventVenue[];
}

const EventDetailPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [eventDetails, setEventDetails] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) return;

      const { data, error: queryError } = await supabase
        .from("events")
        .select(
          `
          event_id,
          name,
          description,
          image_url,
          start_time,
          end_time,
          events_venues!inner (
            event_venue_id, 
            event_venue_date,
            no_of_tickets,
            price,
            venues!inner (
              venue_name,
              locations!inner ( city, state )
            )
          )
        `
        )
        .eq("event_id", eventId)
        .single();

      if (queryError) {
        setError(queryError.message);
      } else if (data) {
        setEventDetails(data as unknown as EventDetail);
      }
      setLoading(false);
    };

    fetchEventDetails();
  }, [eventId]);

  const handleBookTickets = (eventVenue: EventVenue) => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate(`/book/confirm/${eventVenue.event_venue_id}`);
  };

  if (loading)
    return <div className="container mx-auto p-4 text-center">Loading...</div>;
  if (error)
    return (
      <div className="container mx-auto p-4 text-red-500">Error: {error}</div>
    );
  if (!eventDetails)
    return <div className="container mx-auto p-4">Event not found.</div>;

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <img
            src={eventDetails.image_url}
            alt={eventDetails.name}
            className="w-full h-64 object-cover rounded-t-lg"
          />
          <CardTitle className="mt-4 text-4xl font-bold">
            {eventDetails.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            {new Date(eventDetails.start_time).toLocaleDateString()} -{" "}
            {new Date(eventDetails.end_time).toLocaleDateString()}
          </p>
          <p className="text-lg mb-6">{eventDetails.description}</p>

          <h3 className="text-2xl font-bold mb-4">Dates and Venues</h3>
          {eventDetails.events_venues.length > 0 ? (
            <ul className="space-y-4">
              {eventDetails.events_venues.map((eventVenue) => {
                const venueData = eventVenue.venues;
                const locationData = venueData?.locations;

                return (
                  <li
                    key={eventVenue.event_venue_id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    {venueData ? (
                      <>
                        <div>
                          <p className="font-bold">{venueData.venue_name}</p>
                          {locationData ? (
                            <p>
                              {locationData.city}, {locationData.state}
                            </p>
                          ) : (
                            <p>Location not specified.</p>
                          )}
                          <p>
                            Date:{" "}
                            {new Date(
                              eventVenue.event_venue_date
                            ).toLocaleDateString()}
                          </p>
                          <p>Tickets Left: {eventVenue.no_of_tickets}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold mb-2">
                            ₹{eventVenue.price}
                          </p>
                          <Button onClick={() => handleBookTickets(eventVenue)}>
                            Book Tickets
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p>Venue details not available.</p>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>No tickets available for this event yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventDetailPage;
