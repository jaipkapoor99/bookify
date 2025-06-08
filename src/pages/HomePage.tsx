import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/SupabaseClient";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type Event = {
  event_id: number;
  name: string;
  start_time: string;
  venue_id: number;
  image_url: string;
};

const HomePage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .abortSignal(abortController.signal);

      if (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching events:", error);
        }
      } else {
        setEvents(data as Event[]);
      }
      setLoading(false);
    };

    fetchEvents();

    return () => {
      abortController.abort();
    };
  }, []);

  if (loading) {
    return <div>Loading events...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">Upcoming Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Link to={`/events/${event.event_id}`} key={event.event_id}>
            <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <img
                  src={event.image_url}
                  alt={event.name}
                  className="w-full h-48 object-cover"
                />
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle>{event.name}</CardTitle>
              </CardContent>
              <CardFooter className="p-4 bg-gray-50">
                <p>{new Date(event.start_time).toLocaleDateString()}</p>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
