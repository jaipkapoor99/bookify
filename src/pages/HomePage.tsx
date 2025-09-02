import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/SupabaseClient";
import { EventWithVenue } from "@/types/database.types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/PageLoader";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpNarrowWide,
  Calendar,
  Clock,
  MapPin,
  Search,
  Ticket,
} from "lucide-react";

const HomePage = () => {
  const [events, setEvents] = useState<EventWithVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("start_time");

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*, events_venues!inner(venues!inner(venue_name))")
          .order(sortBy, { ascending: true });

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
  }, [sortBy]);

  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return <PageLoader />;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-12">
      <section className="relative -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-10 xl:-mx-12">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 transform -skew-y-3"></div>
        <div className="relative container mx-auto px-4 py-20 md:py-32 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Your Gateway to Unforgettable Experiences
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">
            From intimate concerts to grand festivals, find and book tickets for
            events that create lasting memories.
          </p>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex flex-col md:flex-row gap-4 p-6 bg-card rounded-2xl border shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search events..."
              className="pl-10 h-12 text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48 h-12">
              <ArrowUpNarrowWide className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="start_time">By Date</SelectItem>
              <SelectItem value="name">By Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section>
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="space-y-4">
              <div className="h-24 w-24 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                <Calendar className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold">No events found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Try adjusting your search or filters to find more events.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <Card
                key={event.event_id}
                className="card-hover group overflow-hidden cursor-pointer"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={event.image_url || "/placeholder.svg"}
                    alt={event.name}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                    {event.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(event.start_time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(event.start_time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">
                        {event.events_venues[0]?.venues?.venue_name ||
                          "Venue TBA"}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full button-press">
                    <Link to={`/events/${event.event_id}`}>
                      <Ticket className="w-4 h-4 mr-2" />
                      View Details & Book
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
