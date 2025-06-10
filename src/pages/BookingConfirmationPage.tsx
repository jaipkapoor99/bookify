import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { dbApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Ticket, MapPin, Calendar, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

// Corrected Type: This now matches the structure from the error message.
type RawConfirmationData = {
  price: number;
  event_venue_date: string;
  no_of_tickets: number;
  events: {
    name: string;
  }; // It's an object now
  venues: {
    venue_name: string;
    locations: {
      pincode: string;
    } | null;
  }; // It's an object now
};

// The clean data structure for the component's state.
type ConfirmationDetails = {
  eventName: string;
  venueName: string;
  eventDate: string;
  price: number;
  location: string;
  pincode?: string;
  availableTickets: number;
};

const BookingConfirmationPage = () => {
  const { eventVenueId } = useParams<{ eventVenueId: string }>();
  const [searchParams] = useSearchParams();
  const quantity = parseInt(searchParams.get("quantity") || "1", 10);

  const [details, setDetails] = useState<ConfirmationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<string>("Loading location...");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConfirmationDetails = async () => {
      if (!eventVenueId) return;

      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("events_venues")
        .select(
          `
          price,
          event_venue_date,
          no_of_tickets,
          events!inner ( name ),
          venues!inner ( venue_name, locations!inner ( pincode ) )
        `
        )
        .eq("event_venue_id", eventVenueId)
        .single();

      if (fetchError) {
        setError(`Error fetching details: ${fetchError.message}`);
        setLocation("Location not available");
      } else if (data) {
        const rawData = data as unknown as RawConfirmationData;
        const eventData = rawData.events;
        const venueData = rawData.venues;
        const locationData = venueData?.locations;

        if (eventData && venueData) {
          setDetails({
            price: rawData.price,
            eventDate: rawData.event_venue_date,
            eventName: eventData.name,
            venueName: venueData.venue_name,
            location: "Loading location...", // Default value
            pincode: locationData?.pincode,
            availableTickets: rawData.no_of_tickets,
          });
        } else {
          setError("Could not retrieve complete event and venue details.");
          setLocation("Location not available");
        }
      }
      setLoading(false);
    };

    fetchConfirmationDetails();
  }, [eventVenueId]);

  useEffect(() => {
    const fetchLocationFromPincode = async () => {
      if (!details?.pincode) return;

      try {
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
        const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

        const response = await axios.post(
          `${SUPABASE_URL}/functions/v1/get-location-from-pincode`,
          { pincode: details.pincode },
          {
            headers: {
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              "Content-Type": "application/json",
            },
            timeout: 10000,
          }
        );

        const data = response.data;
        setLocation(
          `${data.area}, ${data.city}, ${data.state} - ${details.pincode}`
        );
      } catch (error) {
        console.warn(
          `Failed to fetch location for pincode ${details.pincode}:`,
          error
        );
        setLocation("Location not available");
      }
    };

    if (details) {
      fetchLocationFromPincode();
    }
  }, [details]);

  const handleConfirmBooking = async () => {
    if (!eventVenueId || !details) return;

    // Validate quantity
    if (quantity > details.availableTickets) {
      toast.error("Not enough tickets available", {
        description: `Only ${details.availableTickets} tickets remaining.`,
      });
      return;
    }

    setBooking(true);
    setError(null);

    try {
      const { error: rpcError } = await dbApi.rpc("book_ticket", {
        p_event_venue_id: parseInt(eventVenueId, 10),
        p_quantity: quantity,
      });

      if (rpcError) throw rpcError;

      toast.success("Booking successful!", {
        description: `You have booked ${quantity} ticket${
          quantity > 1 ? "s" : ""
        }.`,
      });

      setTimeout(() => {
        navigate("/my-bookings");
      }, 1500);
    } catch (bookingError) {
      const e = bookingError as Error;
      setError(`Booking failed: ${e.message}`);
      toast.error("Booking failed", {
        description: e.message,
      });
    } finally {
      setBooking(false);
    }
  };

  const getTotalPrice = () => {
    if (!details) return 0;
    return details.price * quantity;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <div className="text-muted-foreground">
              Loading confirmation details...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !details) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  if (!details) {
    return (
      <div className="container mx-auto p-4">Booking details not found.</div>
    );
  }

  return (
    <div className="container mx-auto p-4 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Confirm Your Booking</CardTitle>
          <CardDescription>
            Please review the details below before confirming your ticket
            {quantity > 1 ? "s" : ""}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg mb-4">Event Details</h3>

            <div className="flex items-start gap-3">
              <Ticket className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Event</p>
                <p className="text-muted-foreground">{details.eventName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Venue</p>
                <p className="text-muted-foreground">{details.venueName}</p>
                <p className="text-sm text-muted-foreground">{location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Date</p>
                <p className="text-muted-foreground">
                  {new Date(details.eventDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Summary
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Ticket Price:</span>
                <span>{formatCurrency(details.price)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Quantity:</span>
                <span>{quantity}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="font-bold text-lg">Total Amount:</span>
                <span className="font-bold text-lg">
                  {formatCurrency(getTotalPrice())}
                </span>
              </div>
            </div>
          </div>

          {details.availableTickets < 10 && (
            <Alert>
              <AlertTitle>Limited Availability</AlertTitle>
              <AlertDescription>
                Only {details.availableTickets} tickets remaining for this
                event.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex-col items-stretch">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Booking Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button
            onClick={handleConfirmBooking}
            disabled={booking || quantity > details.availableTickets}
            className="w-full"
            size="lg"
          >
            {booking
              ? "Processing..."
              : `Confirm & Book ${quantity} Ticket${quantity > 1 ? "s" : ""}`}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BookingConfirmationPage;
