import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/SupabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { Minus, Plus, Calendar, MapPin, Ticket } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import StorageImage from "@/components/ui/StorageImage";

// Corrected Type: This now matches the structure from the error message.
interface EventVenue {
  event_venue_id: number;
  event_venue_date: string;
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

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) return;

      const { data, error: queryError } = await supabase
        .from("events")
        .select(
          `
          event_id,
          name,
          description,
          image_url,
          image_path,
          start_time,
          end_time,
          events_venues!inner (
            event_venue_id, 
            event_venue_date,
            no_of_tickets,
            price,
            venues!inner (
              venue_name,
              locations!inner ( pincode )
            )
          )
        `
        )
        .eq("event_id", eventId)
        .single();

      if (queryError) {
        setError(queryError.message);
      } else if (data) {
        setEventDetails(data as unknown as EventDetail);
      }
      setLoading(false);
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
        const { data, error } = await supabase.functions.invoke(
          "get-location-from-pincode",
          { body: { pincode } }
        );
        return { pincode, data, error };
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
    if (!selectedVenue) return;

    // Navigate to booking confirmation with quantity as a query parameter
    navigate(
      `/book/confirm/${selectedVenue.event_venue_id}?quantity=${ticketQuantity}`
    );
  };

  const getTotalPrice = () => {
    if (!selectedVenue) return 0;
    return selectedVenue.price * ticketQuantity;
  };

  if (loading)
    return <div className="container mx-auto p-4 text-center">Loading...</div>;
  if (error)
    return (
      <div className="container mx-auto p-4 text-red-500">Error: {error}</div>
    );
  if (!eventDetails)
    return <div className="container mx-auto p-4">Event not found.</div>;

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <StorageImage
            imagePath={eventDetails.image_path}
            alt={eventDetails.name}
            className="w-full h-64 object-cover rounded-t-lg"
          />
          <CardTitle className="mt-4 text-4xl font-bold">
            {eventDetails.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(eventDetails.start_time).toLocaleDateString()} -{" "}
                {new Date(eventDetails.end_time).toLocaleDateString()}
              </span>
            </div>
          </div>
          <p className="text-lg mb-6">{eventDetails.description}</p>

          <h3 className="text-2xl font-bold mb-4">Dates and Venues</h3>
          {eventDetails.events_venues.length > 0 ? (
            <div className="grid gap-4">
              {eventDetails.events_venues.map((eventVenue) => {
                const venueData = eventVenue.venues;
                const pincode = venueData.locations?.pincode;
                const locationStr = pincode ? locations[pincode] : null;

                return (
                  <Card
                    key={eventVenue.event_venue_id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      {venueData ? (
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <p className="font-bold text-lg">
                              {venueData.venue_name}
                            </p>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {locationStr ? (
                                <span>{locationStr}</span>
                              ) : (
                                <span>Loading location...</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {new Date(
                                  eventVenue.event_venue_date
                                ).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Ticket className="h-4 w-4 text-muted-foreground" />
                              <span
                                className={
                                  eventVenue.no_of_tickets > 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {eventVenue.no_of_tickets > 0
                                  ? `${eventVenue.no_of_tickets} tickets available`
                                  : "Sold out"}
                              </span>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <p className="text-2xl font-bold">
                              {formatCurrency(eventVenue.price)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              per ticket
                            </p>
                            <Button
                              onClick={() => handleSelectVenue(eventVenue)}
                              disabled={eventVenue.no_of_tickets === 0}
                            >
                              {eventVenue.no_of_tickets > 0
                                ? "Book Tickets"
                                : "Sold Out"}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p>Venue details not available.</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p>No tickets available for this event yet.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Ticket Quantity</DialogTitle>
            <DialogDescription>
              Choose how many tickets you want to purchase for{" "}
              {selectedVenue?.venues.venue_name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Number of Tickets</Label>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={ticketQuantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <Input
                  type="number"
                  value={ticketQuantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    if (
                      value >= 1 &&
                      value <= 10 &&
                      selectedVenue &&
                      value <= selectedVenue.no_of_tickets
                    ) {
                      setTicketQuantity(value);
                    }
                  }}
                  className="w-20 text-center"
                  min={1}
                  max={
                    selectedVenue
                      ? Math.min(10, selectedVenue.no_of_tickets)
                      : 10
                  }
                />

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                  disabled={
                    ticketQuantity >= 10 ||
                    (selectedVenue
                      ? ticketQuantity >= selectedVenue.no_of_tickets
                      : false)
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Maximum{" "}
                {selectedVenue ? Math.min(10, selectedVenue.no_of_tickets) : 10}{" "}
                tickets per booking
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Price per ticket:</span>
                <span>{formatCurrency(selectedVenue?.price || 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(getTotalPrice())}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBookingDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmBooking}>Continue to Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetailPage;
