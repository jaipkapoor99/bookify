import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppState } from "@/contexts/AppStateContext";
import { getImageUrl } from "@/lib/storage";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, MapPin, Filter, Search, Loader2, MoreVertical } from "lucide-react";

export type Event = {
  event_id: number;
  name: string;
  start_time: string;
  venue_id: number;
  image_url: string;
  image_path?: string;
  description?: string;
  venue?: {
    name: string;
    city: string;
  };
};

const HomePage = () => {
  const { state, fetchEvents, isLoading } = useAppState();
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [filterCity, setFilterCity] = useState<string>("all");
  const [cities, setCities] = useState<string[]>([]);
  const [eventImages, setEventImages] = useState<Record<number, string>>({});

  useEffect(() => {
    // Fetch events using the context
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    // Update cities when events change
    const uniqueCities = [...new Set(state.events
      .map(event => event.venue?.city)
      .filter(Boolean))] as string[];
    setCities(uniqueCities);

    // Load image URLs for events with image_path
    const loadImageUrls = async () => {
      const imageMap: Record<number, string> = {};
      
      for (const event of state.events) {
        if (event.image_path) {
          const url = await getImageUrl(event.image_path);
          imageMap[event.event_id] = url || event.image_url || '/placeholder.png';
        } else {
          imageMap[event.event_id] = event.image_url || '/placeholder.png';
        }
      }
      
      setEventImages(imageMap);
    };

    loadImageUrls();
  }, [state.events]);

  useEffect(() => {
    let filtered = [...state.events];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply city filter
    if (filterCity !== "all") {
      filtered = filtered.filter(event => event.venue?.city === filterCity);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    setFilteredEvents(filtered);
  }, [state.events, searchQuery, sortBy, filterCity]);

  const loading = isLoading('events');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">Discover Amazing Events</h1>
        <p className="text-lg text-gray-600">Find and book your next experience</p>
      </div>

      {/* Filters Section */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search events or venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterCity} onValueChange={setFilterCity}>
            <SelectTrigger className="w-full md:w-[180px]">
              <MapPin className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map(city => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: "date" | "name") => setSortBy(value)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">
          {filteredEvents.length} {filteredEvents.length === 1 ? 'Event' : 'Events'} Found
        </h2>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No events found matching your criteria.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.event_id} className="overflow-hidden h-full hover:shadow-xl transition-all duration-300 group">
              <div className="relative">
                <Link to={`/events/${event.event_id}`}>
                  <CardHeader className="p-0">
                    <div className="relative overflow-hidden">
                      <img
                        src={eventImages[event.event_id] || event.image_url || '/placeholder.png'}
                        alt={event.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardHeader>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 bg-white/80 hover:bg-white"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link to={`/events/${event.event_id}`} className="flex items-center w-full">
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Share Event</DropdownMenuItem>
                    <DropdownMenuItem>Save for Later</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Link to={`/events/${event.event_id}`}>
                <CardContent className="p-4">
                  <CardTitle className="line-clamp-2 mb-2">{event.name}</CardTitle>
                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {event.description}
                    </p>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(event.start_time).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </div>
                    {event.venue && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.venue.name}, {event.venue.city}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Link>
              
              <CardFooter className="p-4 bg-gray-50 dark:bg-gray-800">
                <Button asChild className="w-full">
                  <Link to={`/events/${event.event_id}`}>
                    View Details
                  </Link>
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
