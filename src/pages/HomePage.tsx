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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  MapPin,
  Search,
  Loader2,
  Clock,
  Ticket,
  TrendingUp,
  Sparkles,
  Filter,
  SortAsc,
} from "lucide-react";

import StorageImage from "@/components/ui/StorageImage";

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
  const { state, fetchEvents, isLoading } =
    useAppState() as import("@/contexts/AppStateTypes").AppStateContextType;

  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [filterCity, setFilterCity] = useState<string>("all");
  const [locations, setLocations] = useState<Record<string, LocationInfo>>({});
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]); // Include fetchEvents in dependencies

  useEffect(() => {
    const fetchLocations = async () => {
      const pincodes = [
        ...new Set(
          state.events
            .map(
              (event: Event) =>
                event.events_venues?.[0]?.venues?.locations?.pincode,
            )
            .filter((p): p is string => typeof p === "string"),
        ),
      ];

      const newLocations: Record<string, LocationInfo> = {};
      const locationPromises = pincodes.map(async (pincode: string) => {
        // Use a ref to get current locations to avoid dependency loop
        const currentLocations = locations;
        if (!currentLocations[pincode]) {
          try {
            // Fetch location via direct HTTP request to avoid client issues
            const response = await fetch(
              `${
                import.meta.env.VITE_SUPABASE_URL
              }/functions/v1/get-location-from-pincode`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${
                    import.meta.env.VITE_SUPABASE_ANON_KEY
                  }`,
                },
                body: JSON.stringify({ pincode }),
              },
            );

            if (response.ok) {
              const data = await response.json();
              newLocations[pincode] = data as LocationInfo;
            }
          } catch {
            // Silently handle errors
          }
        }
      });

      await Promise.all(locationPromises);

      if (Object.keys(newLocations).length > 0) {
        setLocations((prev) => ({ ...prev, ...newLocations }));
      }
    };

    if (state.events.length > 0) {
      fetchLocations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.events]); // Removed 'locations' to prevent infinite loop

  useEffect(() => {
    if (Object.keys(locations).length > 0) {
      const uniqueCities = [
        ...new Set(Object.values(locations).map((l) => l.city)),
      ].sort();
      setCities(uniqueCities);
    }
  }, [locations]);

  useEffect(() => {
    let filtered = [...state.events];

    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.events_venues?.[0]?.venues?.venue_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    if (filterCity !== "all") {
      filtered = filtered.filter((event) => {
        const pincode = event.events_venues?.[0]?.venues?.locations?.pincode;
        return pincode ? locations[pincode]?.city === filterCity : false;
      });
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

    setFilteredEvents(filtered);
  }, [state.events, searchQuery, sortBy, filterCity, locations]);

  const loading = isLoading("events");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-8">
          {/* Bookify Logo */}
          <div className="flex items-center justify-center gap-3">
            <img
              src="/Bookify_SVG.svg"
              alt="Bookify"
              className="h-12 w-12 object-contain"
            />
            <span className="text-3xl font-bold gradient-text">Bookify</span>
          </div>

          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
            <Sparkles className="h-6 w-6 absolute -top-2 -right-2 text-primary/60 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">
              Loading amazing events...
            </h2>
            <p className="text-muted-foreground">
              Discovering the best experiences for you
            </p>
          </div>
        </div>
      </div>
    );
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

  const getLocationDisplay = (event: Event) => {
    const pincode = event.events_venues?.[0]?.venues?.locations?.pincode;
    if (!pincode) return "Location TBA";

    const location = locations[pincode];
    return location
      ? `${location.city}, ${location.state}`
      : `Pincode: ${pincode}`;
  };

  return (
    <div className="space-y-12">
      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg -skew-y-1 transform origin-top-left"></div>
        <div className="relative px-4 py-20 md:py-32">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <Badge variant="secondary" className="mb-4">
                <TrendingUp className="w-3 h-3 mr-1" />
                Discover Amazing Events
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold gradient-text">
                Your Next Great
                <br />
                Experience Awaits
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                From intimate concerts to grand festivals, find and book tickets
                for events that create lasting memories.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex justify-center gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {state.events.length}+
                </div>
                <div className="text-sm text-muted-foreground">Live Events</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {cities.length}+
                </div>
                <div className="text-sm text-muted-foreground">Cities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Secure</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Search and Filter Section */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row gap-4 p-6 bg-card rounded-2xl border shadow-sm">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search events, venues, or artists..."
              className="pl-10 h-12 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* City Filter */}
          <Select value={filterCity} onValueChange={setFilterCity}>
            <SelectTrigger className="w-full md:w-48 h-12">
              <Filter className="w-4 h-4 mr-2" />
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

          {/* Sort */}
          <Select
            value={sortBy}
            onValueChange={(value: "date" | "name") => setSortBy(value)}
          >
            <SelectTrigger className="w-full md:w-40 h-12">
              <SortAsc className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">By Date</SelectItem>
              <SelectItem value="name">By Name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {filteredEvents.length === 0
              ? "No events found"
              : `${filteredEvents.length} event${
                  filteredEvents.length !== 1 ? "s" : ""
                } found`}
            {searchQuery && (
              <span className="ml-1">
                for "
                <span className="font-medium text-foreground">
                  {searchQuery}
                </span>
                "
              </span>
            )}
          </p>

          {(searchQuery || filterCity !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setFilterCity("all");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      </section>

      {/* Enhanced Events Grid */}
      <section>
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="space-y-4">
              <div className="h-24 w-24 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                <Calendar className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold">No events found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchQuery || filterCity !== "all"
                  ? "Try adjusting your search or filters to find more events."
                  : "Check back soon for new events and experiences."}
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
                  <StorageImage
                    imagePath={event.image_path || event.image_url}
                    alt={event.name}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-black/70 text-white border-0">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(event.start_time)}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="space-y-3">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                    {event.name}
                  </CardTitle>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(event.start_time)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">
                        {event.events_venues?.[0]?.venues?.venue_name ||
                          "Venue TBA"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4" />
                      <span>{getLocationDisplay(event)}</span>
                    </div>
                  </div>
                </CardHeader>

                {event.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  </CardContent>
                )}

                <CardFooter className="pt-0">
                  <Button asChild className="w-full button-press">
                    <Link to={`/events/${event.event_id}`}>
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
