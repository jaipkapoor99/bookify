import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppState } from "@/hooks/useAppState";
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
import {
  Calendar,
  MapPin,
  Filter,
  Search,
  Loader2,
  MoreVertical,
} from "lucide-react";
import { supabase } from "@/SupabaseClient";
import StorageImage from "@/components/ui/StorageImage";

console.log(`🔥 HomePage module loading`);

export type Event = {
  event_id: number;
  name: string;
  start_time: string;
  image_url: string;
  image_path?: string;
  description?: string;
  events_venues: {
    venues: {
      venue_name: string;
      locations: {
        pincode: string;
      } | null;
    } | null;
  }[];
};

type LocationInfo = {
  city: string;
  state: string;
  area: string;
};

const HomePage = () => {
  console.log(`�� HomePage component instantiated`);
  console.log(`🏠 HomePage component rendering`);
  const { state, fetchEvents, isLoading } =
    useAppState() as import("@/contexts/AppStateTypes").AppStateContextType;
  console.log(`📊 HomePage - Current state:`, {
    eventsCount: state.events.length,
    eventVenuesCount: Object.keys(state.eventVenues).length,
    venuesCount: state.venues.length,
    loading: state.loading,
  });

  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [filterCity, setFilterCity] = useState<string>("all");
  const [locations, setLocations] = useState<Record<string, LocationInfo>>({});
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    console.log(
      `🔧 HomePage useEffect[fetchLocations] - state.events length:`,
      state.events.length
    );
    const fetchLocations = async () => {
      const pincodes = [
        ...new Set(
          state.events
            .map(
              (event: Event) =>
                event.events_venues?.[0]?.venues?.locations?.pincode
            )
            .filter((p): p is string => typeof p === "string")
        ),
      ];
      console.log(`📍 Found pincodes to fetch:`, pincodes);

      const newLocations: Record<string, LocationInfo> = {};
      const locationPromises = pincodes.map(async (pincode: string) => {
        // Use a ref to get current locations to avoid dependency loop
        const currentLocations = locations;
        if (!currentLocations[pincode]) {
          console.log(`📍 Fetching location for pincode: ${pincode}`);
          // Fetch only if not already in state
          const { data, error } = await supabase.functions.invoke(
            "get-location-from-pincode",
            { body: { pincode } }
          );
          if (!error) {
            console.log(`✅ Location data for ${pincode}:`, data);
            newLocations[pincode] = data as LocationInfo;
          } else {
            console.error(`❌ Error fetching location for ${pincode}:`, error);
          }
        }
      });

      await Promise.all(locationPromises);

      if (Object.keys(newLocations).length > 0) {
        console.log(`🔄 Updating locations state with:`, newLocations);
        setLocations((prev) => ({ ...prev, ...newLocations }));
      }
    };

    if (state.events.length > 0) {
      fetchLocations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.events]); // Removed 'locations' to prevent infinite loop

  useEffect(() => {
    console.log(
      `🔧 HomePage useEffect[cities] - locations count:`,
      Object.keys(locations).length
    );
    if (Object.keys(locations).length > 0) {
      const uniqueCities = [
        ...new Set(Object.values(locations).map((l) => l.city)),
      ].sort();
      console.log(`🏙️ Setting cities:`, uniqueCities);
      setCities(uniqueCities);
    }
  }, [locations]);

  useEffect(() => {
    console.log(
      `🔧 HomePage useEffect[filtering] - Filtering events with searchQuery: "${searchQuery}", filterCity: "${filterCity}", sortBy: "${sortBy}"`
    );
    let filtered = [...state.events];
    console.log(`📋 Starting with ${filtered.length} events`);

    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.events_venues?.[0]?.venues?.venue_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
      console.log(`🔍 After search filter: ${filtered.length} events`);
    }

    if (filterCity !== "all") {
      filtered = filtered.filter((event) => {
        const pincode = event.events_venues?.[0]?.venues?.locations?.pincode;
        return pincode ? locations[pincode]?.city === filterCity : false;
      });
      console.log(`🏙️ After city filter: ${filtered.length} events`);
    }

    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return (
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    console.log(`📋 Final filtered events count: ${filtered.length}`);
    setFilteredEvents(filtered);
  }, [state.events, searchQuery, sortBy, filterCity, locations]);

  const loading = isLoading("events");
  console.log(`⏳ HomePage loading state: ${loading}`);

  if (loading) {
    console.log(`🔄 HomePage showing loading screen`);
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-2xl font-bold text-gray-700 opacity-75">
              Bookify
            </span>
          </div>
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  console.log(
    `🎯 HomePage rendering main content with ${filteredEvents.length} filtered events`
  );

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">
          Discover Amazing Events
        </h1>
        <p className="text-lg text-gray-600">
          Find and book your next experience
        </p>
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

          <Select
            value={filterCity}
            onValueChange={setFilterCity}
            disabled={cities.length === 0}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <MapPin className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value: "date" | "name") => setSortBy(value)}
          >
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
          {filteredEvents.length}{" "}
          {filteredEvents.length === 1 ? "Event" : "Events"} Found
        </h2>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            No events found matching your criteria.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const pincode =
              event.events_venues?.[0]?.venues?.locations?.pincode;
            const location = pincode ? locations[pincode] : null;

            return (
              <Card
                key={event.event_id}
                className="overflow-hidden h-full hover:shadow-xl transition-all duration-300 group"
              >
                <div className="relative">
                  <Link to={`/events/${event.event_id}`}>
                    <CardHeader className="p-0">
                      <div className="relative overflow-hidden">
                        <StorageImage
                          imagePath={event.image_path}
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
                        <Link
                          to={`/events/${event.event_id}`}
                          className="flex items-center w-full"
                        >
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
                    <CardTitle className="line-clamp-2 mb-2">
                      {event.name}
                    </CardTitle>
                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {event.description}
                      </p>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(event.start_time).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                      {event.events_venues?.[0]?.venues && location && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          {event.events_venues[0].venues.venue_name},{" "}
                          {location.city}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Link>

                <CardFooter className="p-4 bg-gray-50 dark:bg-gray-800">
                  <Button asChild className="w-full">
                    <Link to={`/events/${event.event_id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HomePage;
