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
import { Minus, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

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
              <p className="text-sm">
                {formatCurrency(eventVenue.price / 100)}
              </p>
            </div>
            <Button onClick={() => handleBookNow(eventVenue)}>Book Now</Button>
          </div>
        ))}
      </div>

      <Dialog open={isBooking} onOpenChange={setIsBooking}>
        <DialogContent>
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
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label htmlFor="quantity">Tickets:</Label>
                <div className="flex items-center gap-2">
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
                    className="w-16 text-center"
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
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedVenue.no_of_tickets} tickets available
              </p>
              <div className="text-2xl font-bold">
                Total:{" "}
                {formatCurrency((ticketCount * selectedVenue.price) / 100)}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBooking(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmBooking}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetailPage;
