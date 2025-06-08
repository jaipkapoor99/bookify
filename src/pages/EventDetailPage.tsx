import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/SupabaseClient";
import { type Event } from "@/pages/HomePage";

type EventDetail = Event & { description: string };

const EventDetailPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;

      setLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select("*, venues(name)")
        .eq("event_id", eventId)
        .single();

      if (error) {
        setError(`Error: ${error.message}`);
      } else {
        setEvent(data as EventDetail);
      }
      setLoading(false);
    };

    fetchEvent();
  }, [eventId]);

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
        className="w-full h-96 object-cover rounded-lg mb-6"
      />
      <h1 className="text-4xl font-bold mb-2">{event.name}</h1>
      <p className="text-xl text-gray-600 mb-4">
        {new Date(event.start_time).toLocaleString()}
      </p>
      <p className="text-lg">{event.description}</p>
    </div>
  );
};

export default EventDetailPage;
