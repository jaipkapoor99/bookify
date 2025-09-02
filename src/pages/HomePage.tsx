import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/SupabaseClient";
import { Event } from "@/types/database.types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/PageLoader";
import { toast } from "sonner";

const HomePage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("start_time", { ascending: true });

        if (error) {
          throw error;
        }
        setEvents(data || []);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        toast.error("Failed to fetch events", {
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Upcoming Events</h1>
      {events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {events.map((event) => (
            <Card key={event.event_id}>
              <CardContent className="p-0">
                <img
                  src={event.image_url || "/placeholder.svg"}
                  alt={event.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{event.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.start_time).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link to={`/events/${event.event_id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
