import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/SupabaseClient";
import { Event, EventVenue } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/PageLoader";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Minus,
  Plus,
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Ticket,
  Users,
  Heart,
  Share2,
  CircleAlert,
  CircleCheckBig,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const EventDetailPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [venues, setVenues] = useState<EventVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState<EventVenue | null>(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [isBooking, setIsBooking] = useState(false);

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

  const handleBookNow = (venue: EventVenue) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setSelectedVenue(venue);
    setTicketCount(1);
    setIsBooking(true);
  };

  const handleConfirmBooking = () => {
    if (!selectedVenue) return;
    navigate(
      `/book/confirm/${selectedVenue.event_venue_id}?quantity=${ticketCount}`,
    );
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!event) {
    return <div>Event not found.</div>;
  }

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

  return (
    <div className="space-y-8">
      <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Events
      </Button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src={event.image_url || "/placeholder.svg"}
            alt={event.name}
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
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-3">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDate(event.start_time)}
            </Badge>
            <h1 className="text-4xl font-bold mb-4">{event.name}</h1>
            {event.description && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Event Time</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(event.start_time)} -{" "}
                      {formatTime(event.end_time)}
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
                      {venues.length} locations
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">
            Select Venue & Book Tickets
          </h2>
          <p className="text-muted-foreground">
            Choose your preferred venue and secure your tickets now
          </p>
        </div>
        {venues.length === 0 ? (
          <Card className="p-8">
            <div className="text-center">
              <CircleAlert className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
            {venues.map((eventVenue) => {
              const isAvailable = eventVenue.no_of_tickets > 0;
              return (
                <Card
                  key={eventVenue.event_venue_id}
                  className={`card-hover ${
                    isAvailable ? "" : "opacity-60"
                  } ${isAvailable ? "cursor-pointer" : "cursor-not-allowed"}`}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">
                          {eventVenue.venues?.venue_name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-1">Location TBA</span>
                        </div>
                      </div>
                      {isAvailable ? (
                        <Badge variant="secondary">
                          <CircleCheckBig className="w-3 h-3 mr-1" />
                          Available
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <CircleAlert className="w-3 h-3 mr-1" />
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
                        <div className="text-2xl font-bold">
                          {formatCurrency(eventVenue.price)}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleBookNow(eventVenue)}
                        disabled={!isAvailable}
                        className="w-full button-press"
                      >
                        {user
                          ? isAvailable
                            ? "Book Now"
                            : "Sold Out"
                          : "Login to Book"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={isBooking} onOpenChange={setIsBooking}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book Tickets</DialogTitle>
            <DialogDescription>
              {selectedVenue && (
                <>
                  {selectedVenue.venues?.venue_name} • {event?.name}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedVenue && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="quantity">Number of Tickets</Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                    disabled={ticketCount <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    value={ticketCount}
                    onChange={(e) =>
                      setTicketCount(parseInt(e.target.value, 10))
                    }
                    min="1"
                    max={selectedVenue.no_of_tickets}
                    className="text-center w-20"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setTicketCount(
                        Math.min(selectedVenue.no_of_tickets, ticketCount + 1),
                      )
                    }
                    disabled={ticketCount >= selectedVenue.no_of_tickets}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Maximum 10 tickets per booking • {selectedVenue.no_of_tickets}{" "}
                  available
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Price per ticket</span>
                  <span>{formatCurrency(selectedVenue.price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Quantity</span>
                  <span>{ticketCount}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>
                    {formatCurrency(ticketCount * selectedVenue.price)}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsBooking(false)}>
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
