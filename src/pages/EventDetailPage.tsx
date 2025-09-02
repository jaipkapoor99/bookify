import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/SupabaseClient";
import { Event, EventVenue } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/PageLoader";
import { toast } from "sonner";

const EventDetailPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [venues, setVenues] = useState<EventVenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) return;
      setLoading(true);
      try {
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("event_id", eventId)
          .single();

        if (eventError) throw eventError;
        setEvent(eventData);

        const { data: venueData, error: venueError } = await supabase
          .from("events_venues")
          .select("*, venues(*)")
          .eq("event_id", eventId);

        if (venueError) throw venueError;
        setVenues(venueData || []);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        toast.error("Failed to fetch event details", {
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  if (loading) {
    return <PageLoader />;
  }

  if (!event) {
    return <div>Event not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
      <p className="text-muted-foreground mb-4">{event.description}</p>
      <img
        src={event.image_url || "/placeholder.svg"}
        alt={event.name}
        className="w-full h-96 object-cover rounded-lg mb-6"
      />

      <h2 className="text-2xl font-bold mb-4">Venues & Tickets</h2>
      <div className="space-y-4">
        {venues.map((eventVenue) => (
          <div
            key={eventVenue.event_venue_id}
            className="p-4 border rounded-lg flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold">{eventVenue.venues?.venue_name}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(eventVenue.event_venue_date).toLocaleDateString()}
              </p>
              <p className="text-sm">${eventVenue.price}</p>
            </div>
            <Button>Book Now</Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventDetailPage;
