import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/SupabaseClient";
import { useAuth } from "@/hooks/useAuth";

type EventVenue = {
  id: number;
  event_venue_date: string;
  venues: {
    venue_name: string;
  };
};

type EventDetail = {
  event_id: number;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  image_url: string;
  events_venues: EventVenue[];
};

const EventDetailPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;

      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("events")
        .select(
          `
          *,
          events_venues (
            event_venue_date,
            id,
            venues (
              venue_name
            )
          )
        `
        )
        .eq("event_id", eventId)
        .single();

      if (fetchError) {
        setError(`Error: ${fetchError.message}`);
      } else {
        setEvent(data as EventDetail);
      }
      setLoading(false);
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const handleBookTickets = async (eventVenue: EventVenue) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const { error: rpcError } = await supabase.rpc("book_ticket", {
        p_event_venue_id: eventVenue.id,
        p_user_id: user.id,
      });

      if (rpcError) {
        throw rpcError;
      }

      alert("Ticket booked successfully!");
    } catch (bookingError) {
      const error = bookingError as Error;
      alert(`Error booking ticket: ${error.message}`);
    }
  };

  if (loading) {
    return <div>Loading event details...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!event) {
    return <div>Event not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <img
        src={event.image_url}
        alt={event.name}
        className="w-full h-96 object-cover rounded-lg mb-4"
      />
      <h1 className="text-4xl font-bold mb-2">{event.name}</h1>
      <p className="text-xl text-gray-600 mb-4">
        {new Date(event.start_time).toLocaleString()} -{" "}
        {new Date(event.end_time).toLocaleString()}
      </p>
      <p className="text-lg text-gray-800 mb-6">{event.description}</p>

      <div className="bg-gray-100 p-6 rounded-lg">
        <h2 className="text-3xl font-bold mb-4">Dates and Venues</h2>
        <ul className="space-y-4">
          {event.events_venues.map((eventVenue: EventVenue) => (
            <li
              key={eventVenue.venues.venue_name + eventVenue.event_venue_date}
              className="p-4 bg-white rounded-md shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-xl text-gray-800">
                  {eventVenue.venues.venue_name}
                </p>
                <p className="text-gray-600">
                  {new Date(eventVenue.event_venue_date).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleBookTickets(eventVenue)}
                className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Book Tickets
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EventDetailPage;
