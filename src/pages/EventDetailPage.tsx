import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
// import { dbApi } from "@/lib/api-client"; // TODO: May be needed for future enhancements
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import {
  Minus,
  Plus,
  Calendar,
  MapPin,
  Ticket,
  Clock,
  Users,
  IndianRupee,
  AlertCircle,
  CheckCircle,
  Share2,
  Heart,
  ArrowLeft,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import StorageImage from "@/components/ui/StorageImage";

// Corrected Type: This now matches the structure from the error message.
interface EventVenue {
  event_venue_id: number;
  event_venue_date: string; // User corrected database to use event_venue_date
  no_of_tickets: number;
  price: number;
  venues: {
    venue_name: string;
    locations: {
      pincode: string;
    } | null;
  }; // venues is now an object
}

interface EventDetail {
  event_id: number;
  name: string;
  description: string;
  image_url: string;
  image_path: string | null;
  start_time: string;
  end_time: string;
  events_venues: EventVenue[];
}

const EventDetailPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [eventDetails, setEventDetails] = useState<EventDetail | null>(null);
  const [locations, setLocations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<EventVenue | null>(null);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch data from Supabase directly like AppStateProvider does
  const fetchFromSupabase = async (
    table: string,
    query: string,
    filters: string = ""
  ) => {
    const url = `${
      import.meta.env.VITE_SUPABASE_URL
    }/rest/v1/${table}?select=${encodeURIComponent(query)}${filters}`;

    const response = await fetch(url, {
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY!}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) return;

      try {
        // First, fetch the basic event details
        const eventQuery =
          "event_id,name,description,image_url,image_path,start_time,end_time";
        const eventFilters = `&event_id=eq.${eventId}`;
        const eventData = await fetchFromSupabase(
          "events",
          eventQuery,
          eventFilters
        );

        if (!eventData || eventData.length === 0) {
          setError("Event not found");
          return;
        }

        const event = eventData[0];

        // Then fetch the events_venues with venues and locations joined
        const eventsVenuesQuery = "*,venues(*,locations(*))";
        const eventsVenuesFilters = `&event_id=eq.${eventId}`;
        const eventsVenuesData = await fetchFromSupabase(
          "events_venues",
          eventsVenuesQuery,
          eventsVenuesFilters
        );

        const eventDetail: EventDetail = {
          ...event,
          events_venues: eventsVenuesData || [],
        };

        console.log("Fetched event detail with real prices:", eventDetail);
        setEventDetails(eventDetail);
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch event details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  useEffect(() => {
    const fetchLocations = async () => {
      if (!eventDetails) return;

      const pincodes = [
        ...new Set(
          eventDetails.events_venues
            .map((ev) => ev.venues.locations?.pincode)
            .filter((p): p is string => !!p)
        ),
      ];

      const locationPromises = pincodes.map(async (pincode) => {
        try {
          const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
          const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

          const response = await axios.post(
            `${SUPABASE_URL}/functions/v1/get-location-from-pincode`,
            { pincode },
            {
              headers: {
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                "Content-Type": "application/json",
              },
              timeout: 10000,
            }
          );

          return { pincode, data: response.data, error: null };
        } catch (err) {
          console.warn(`Failed to fetch location for pincode ${pincode}:`, err);
          return { pincode, data: null, error: "Failed to fetch location" };
        }
      });

      const results = await Promise.all(locationPromises);

      const newLocations: Record<string, string> = {};
      results.forEach(({ pincode, data, error }) => {
        if (error) {
          newLocations[pincode] = "Location not available";
        } else {
          newLocations[
            pincode
          ] = `${data.area}, ${data.city}, ${data.state} - ${pincode}`;
        }
      });

      setLocations(newLocations);
    };

    fetchLocations();
  }, [eventDetails]);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = ticketQuantity + delta;
    if (
      newQuantity >= 1 &&
      newQuantity <= 10 &&
      selectedVenue &&
      newQuantity <= selectedVenue.no_of_tickets
    ) {
      setTicketQuantity(newQuantity);
    }
  };

  const handleSelectVenue = (eventVenue: EventVenue) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setSelectedVenue(eventVenue);
    setTicketQuantity(1);
    setShowBookingDialog(true);
  };

  const handleConfirmBooking = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (selectedVenue) {
      navigate(
        `/book/confirm/${selectedVenue.event_venue_id}?quantity=${ticketQuantity}`
      );
    }
  };

  const getTotalPrice = () => {
    return selectedVenue ? selectedVenue.price * ticketQuantity : 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !eventDetails) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6">
          {/* Bookify Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <img
              src="/Bookify_SVG.svg"
              alt="Bookify"
              className="h-10 w-10 object-contain"
            />
            <span className="text-2xl font-bold gradient-text">Bookify</span>
          </div>

          <div className="space-y-4">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold">Event Not Found</h1>
            <p className="text-muted-foreground">
              {error || "The event you're looking for doesn't exist."}
            </p>
            <Button onClick={() => navigate("/")} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Events
      </Button>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Event Image */}
        <div className="relative overflow-hidden rounded-2xl">
          <StorageImage
            imagePath={eventDetails.image_path || eventDetails.image_url}
            alt={eventDetails.name}
            className="w-full aspect-[4/3] object-cover"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <Button size="icon" variant="secondary" className="rounded-full">
              <Heart className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary" className="rounded-full">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Event Info */}
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-3">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDate(eventDetails.start_time)}
            </Badge>
            <h1 className="text-4xl font-bold mb-4">{eventDetails.name}</h1>
            {eventDetails.description && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {eventDetails.description}
              </p>
            )}
          </div>

          {/* Event Details Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Event Time</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(eventDetails.start_time)} -{" "}
                      {formatTime(eventDetails.end_time)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Ticket className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Available Venues</p>
                    <p className="text-sm text-muted-foreground">
                      {eventDetails.events_venues.length} locations
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Venues Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">
            Select Venue & Book Tickets
          </h2>
          <p className="text-muted-foreground">
            Choose your preferred venue and secure your tickets now
          </p>
        </div>

        {eventDetails.events_venues.length === 0 ? (
          <Card className="p-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No Venues Available
              </h3>
              <p className="text-muted-foreground">
                Tickets are not currently available for this event.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventDetails.events_venues.map((eventVenue) => {
              const pincode = eventVenue.venues.locations?.pincode;
              const locationDisplay = pincode
                ? locations[pincode] || `Pincode: ${pincode}`
                : "Location TBA";
              const isAvailable = eventVenue.no_of_tickets > 0;

              return (
                <Card
                  key={eventVenue.event_venue_id}
                  className={`card-hover ${!isAvailable ? "opacity-60" : ""} ${
                    isAvailable ? "cursor-pointer" : "cursor-not-allowed"
                  }`}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">
                          {eventVenue.venues.venue_name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-1">
                            {locationDisplay}
                          </span>
                        </div>
                      </div>
                      {isAvailable ? (
                        <Badge variant="secondary">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Available
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Sold Out
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {eventVenue.no_of_tickets} tickets left
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium">
                          Price per ticket
                        </span>
                        <div className="flex items-center gap-1 text-2xl font-bold">
                          <IndianRupee className="h-5 w-5" />
                          {formatCurrency(eventVenue.price)}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleSelectVenue(eventVenue)}
                        disabled={!isAvailable}
                        className="w-full button-press"
                      >
                        {!user
                          ? "Login to Book"
                          : isAvailable
                          ? "Book Now"
                          : "Sold Out"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book Tickets</DialogTitle>
            <DialogDescription>
              {selectedVenue && (
                <>
                  {selectedVenue.venues.venue_name} • {eventDetails.name}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedVenue && (
            <div className="space-y-6">
              {/* Quantity Selector */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Number of Tickets</Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={ticketQuantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    value={ticketQuantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (
                        value >= 1 &&
                        value <= Math.min(10, selectedVenue.no_of_tickets)
                      ) {
                        setTicketQuantity(value);
                      }
                    }}
                    min={1}
                    max={Math.min(10, selectedVenue.no_of_tickets)}
                    className="text-center w-20"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    disabled={
                      ticketQuantity >=
                      Math.min(10, selectedVenue.no_of_tickets)
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Maximum 10 tickets per booking • {selectedVenue.no_of_tickets}{" "}
                  available
                </p>
              </div>

              {/* Price Summary */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Price per ticket</span>
                  <span className="flex items-center gap-1">
                    <IndianRupee className="h-3 w-3" />
                    {formatCurrency(selectedVenue.price)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Quantity</span>
                  <span>{ticketQuantity}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="flex items-center gap-1">
                    <IndianRupee className="h-4 w-4" />
                    {formatCurrency(getTotalPrice())}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowBookingDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmBooking} className="button-press">
              Continue to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetailPage;
