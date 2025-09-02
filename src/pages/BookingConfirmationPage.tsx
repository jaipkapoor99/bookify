import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/SupabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { EventVenue } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/PageLoader";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

const BookingConfirmationPage = () => {
  const { eventVenueId } = useParams<{ eventVenueId: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [eventVenue, setEventVenue] = useState<EventVenue | null>(null);
  const [loading, setLoading] = useState(true);
  const [ticketCount, setTicketCount] = useState(1);

  useEffect(() => {
    const fetchEventVenue = async () => {
      if (!eventVenueId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("events_venues")
          .select("*, events(*), venues(*)")
          .eq("event_venue_id", eventVenueId)
          .single();

        if (error) throw error;
        setEventVenue(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        toast.error("Failed to fetch event details", {
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEventVenue();
  }, [eventVenueId]);

  const handleConfirmBooking = async () => {
    if (!profile || !eventVenue) return;

    try {
      const { error } = await supabase.from("tickets").insert({
        customer_id: profile.user_id,
        event_venue_id: eventVenue.event_venue_id,
        quantity: ticketCount,
        ticket_price: eventVenue.price,
      });

      if (error) throw error;

      toast.success("Booking confirmed!");
      navigate("/my-bookings");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error("Failed to confirm booking", {
        description: error.message,
      });
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!eventVenue) {
    return <div>Event details not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Confirm Your Booking</h1>
      <div className="p-4 border rounded-lg">
        <h2 className="text-2xl font-semibold">{eventVenue.events?.name}</h2>
        <p>Venue: {eventVenue.venues?.venue_name}</p>
        <p>
          Date: {new Date(eventVenue.event_venue_date).toLocaleDateString()}
        </p>
        <p>Price per ticket: {formatCurrency(eventVenue.price)}</p>
        <div className="flex items-center gap-4 my-4">
          <label>Tickets:</label>
          <input
            type="number"
            min="1"
            value={ticketCount}
            onChange={(e) => setTicketCount(parseInt(e.target.value, 10))}
            className="w-20 p-2 border rounded"
          />
        </div>
        <p className="text-xl font-bold">
          Total: {formatCurrency(ticketCount * eventVenue.price)}
        </p>
        <Button onClick={handleConfirmBooking} className="mt-4">
          Confirm Booking
        </Button>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
