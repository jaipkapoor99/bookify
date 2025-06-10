import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { BookingQueryResult } from "@/types/database.types";
import { formatCurrency } from "@/lib/utils";
import debug from "@/lib/debug";

const MyBookingsPage = () => {
  const {
    user,
    bookings = [], // Default to empty array
    loadingBookings = false, // Default to false
    bookingsError = null, // Default to null
    locationDetails = {}, // Default to empty object
    refreshBookings,
  } = useAuth();

  // Debug log when component mounts
  useEffect(() => {
    debug.info("MyBookingsPage mounted", {
      hasUser: !!user,
      bookingsCount: bookings?.length || 0,
      loading: loadingBookings,
      error: bookingsError,
    });
  }, [user, bookings?.length, loadingBookings, bookingsError]);

  // Early return if user is not authenticated
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
          <p>Please log in to view your bookings.</p>
        </div>
      </div>
    );
  }

  const getDisplayLocation = (ticket: BookingQueryResult) => {
    const locationData = ticket.events_venues.venues?.locations;
    if (!locationData) return "Location not available";

    const details = locationDetails[locationData.pincode];
    if (details) {
      return `${details.area}, ${details.city}, ${details.state}`;
    }

    // Fallback to database location data
    return `${locationData.area}, ${locationData.city}, ${locationData.state}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        {refreshBookings && (
          <Button
            onClick={refreshBookings}
            disabled={loadingBookings}
            variant="outline"
          >
            {loadingBookings ? "Refreshing..." : "Refresh"}
          </Button>
        )}
      </div>

      {loadingBookings && bookings.length === 0 && (
        <div className="text-center py-8">
          <p className="text-lg">Loading your bookings...</p>
        </div>
      )}

      {bookingsError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <h3 className="text-red-800 font-medium">Error loading bookings</h3>
          <p className="text-red-600 mt-1">{bookingsError}</p>
          {refreshBookings && (
            <Button
              onClick={refreshBookings}
              className="mt-3"
              size="sm"
              variant="outline"
            >
              Try Again
            </Button>
          )}
        </div>
      )}

      {!loadingBookings && !bookingsError && bookings.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            No bookings found
          </h2>
          <p className="text-gray-500">
            You haven't made any bookings yet. Start by browsing our events!
          </p>
        </div>
      )}

      {bookings.length > 0 && (
        <div className="space-y-6">
          {bookings.map((ticket) => (
            <div
              key={ticket.ticket_id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-6"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {ticket.events_venues.events?.name ||
                      "Event Name Not Available"}
                  </h3>

                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Venue:</span>{" "}
                      {ticket.events_venues.venues?.venue_name ||
                        "Venue Not Available"}
                    </p>

                    <p>
                      <span className="font-medium">Address:</span>{" "}
                      {ticket.events_venues.venues?.venue_address ||
                        "Address Not Available"}
                    </p>

                    <p>
                      <span className="font-medium">Location:</span>{" "}
                      {getDisplayLocation(ticket)}
                    </p>

                    <p>
                      <span className="font-medium">Event Date:</span>{" "}
                      {ticket.events_venues.event_venue_date
                        ? formatDate(ticket.events_venues.event_venue_date)
                        : "Date Not Available"}
                    </p>

                    <p>
                      <span className="font-medium">Booked On:</span>{" "}
                      {formatDateTime(ticket.created_at)}
                    </p>
                  </div>
                </div>

                <div className="md:text-right">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      Quantity: {ticket.quantity}
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(ticket.ticket_price)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Ticket ID: {ticket.ticket_id}
                    </p>
                  </div>
                </div>
              </div>

              {ticket.events_venues.events?.description && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">About:</span>{" "}
                    {ticket.events_venues.events.description}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
