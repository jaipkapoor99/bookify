import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/SupabaseClient";
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

// Corrected Type: This now matches the structure from the error message.
type RawConfirmationData = {
  price: number;
  event_venue_date: string;
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
};

const BookingConfirmationPage = () => {
  const { eventVenueId } = useParams<{ eventVenueId: string }>();
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

      const { data, error } = await supabase.functions.invoke(
        "get-location-from-pincode",
        {
          body: { pincode: details.pincode },
        }
      );

      if (error) {
        setLocation("Location not available");
      } else {
        setLocation(
          `${data.area}, ${data.city}, ${data.state} - ${details.pincode}`
        );
      }
    };

    if (details) {
      fetchLocationFromPincode();
    }
  }, [details]);

  const handleConfirmBooking = async () => {
    if (!eventVenueId) return;

    setBooking(true);
    setError(null);

    try {
      const { error: rpcError } = await supabase.rpc("book_ticket", {
        p_event_venue_id: parseInt(eventVenueId, 10),
      });

      if (rpcError) throw rpcError;

      alert("Booking successful! Redirecting to your bookings page...");
      navigate("/my-bookings");
    } catch (bookingError) {
      const e = bookingError as Error;
      setError(`Booking failed: ${e.message}`);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        Loading confirmation details...
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
          <CardTitle>Confirm Your Booking</CardTitle>
          <CardDescription>
            Please review the details below before confirming your ticket.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-lg">Event:</span>
            <span className="text-lg">{details.eventName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-lg">Venue:</span>
            <span className="text-lg">{details.venueName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-lg">Location:</span>
            <span className="text-lg">{location}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-lg">Date:</span>
            <span className="text-lg">
              {new Date(details.eventDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between items-center border-t pt-4 mt-4">
            <span className="font-bold text-xl">Total Price:</span>
            <span className="font-bold text-xl">₹{details.price}</span>
          </div>
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
            disabled={booking}
            className="w-full"
            size="lg"
          >
            {booking ? "Booking..." : "Confirm & Book Ticket"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BookingConfirmationPage;
