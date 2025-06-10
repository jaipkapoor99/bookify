import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { BookingQueryResult } from "@/types/database.types";
import { formatCurrency } from "@/lib/utils";
import { Calendar, MapPin, Ticket, Hash } from "lucide-react";
import StorageImage from "@/components/ui/StorageImage";
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
    const locationData = ticket.events_venues?.venues?.locations;
    if (!locationData) return "Location not available";

    const details = locationDetails[locationData.pincode];
    if (details) {
      return `${details.area}, ${details.city}, ${details.state}`;
    }

    // Since database location only has pincode, show just that if no external data
    return `Pincode: ${locationData.pincode}`;
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
            <Card
              key={ticket.ticket_id}
              className="overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Event Image */}
                  <div className="lg:w-64 lg:flex-shrink-0">
                    <StorageImage
                      imagePath={
                        ticket.events_venues?.events?.image_path ||
                        ticket.events_venues?.events?.image_url
                      }
                      alt={ticket.events_venues?.events?.name || "Event"}
                      className="w-full h-48 lg:h-full object-cover"
                    />
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          {ticket.events_venues?.events?.name ||
                            "Event Name Not Available"}
                        </h3>

                        <div className="space-y-3">
                          {/* Venue */}
                          <div className="flex items-center text-gray-700">
                            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="font-medium">
                              {ticket.events_venues?.venues?.venue_name ||
                                "Venue Not Available"}
                            </span>
                          </div>

                          {/* Location */}
                          <div className="flex items-start text-gray-600">
                            <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                            <span>{getDisplayLocation(ticket)}</span>
                          </div>

                          {/* Event Date */}
                          <div className="flex items-center text-gray-700">
                            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                            <span>
                              {ticket.events_venues?.event_venue_date
                                ? formatDate(
                                    ticket.events_venues.event_venue_date
                                  )
                                : "Date Not Available"}
                            </span>
                          </div>

                          {/* Description */}
                          {ticket.events_venues?.events?.description && (
                            <p className="text-gray-600 text-sm mt-3 line-clamp-2">
                              {ticket.events_venues.events.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="lg:w-48 bg-gray-50 p-4 rounded-lg">
                        <div className="space-y-3">
                          {/* Ticket Price */}
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">
                              {formatCurrency(ticket.ticket_price)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Total Amount
                            </p>
                          </div>

                          {/* Quantity */}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <Ticket className="h-4 w-4 mr-1 text-gray-500" />
                              <span>Quantity:</span>
                            </div>
                            <span className="font-medium">
                              {ticket.quantity}
                            </span>
                          </div>

                          {/* Ticket ID */}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <Hash className="h-4 w-4 mr-1 text-gray-500" />
                              <span>Ticket ID:</span>
                            </div>
                            <span className="font-mono text-xs">
                              {ticket.ticket_id}
                            </span>
                          </div>

                          {/* Booking Date */}
                          <div className="pt-2 border-t border-gray-200">
                            <p className="text-xs text-gray-500">Booked on</p>
                            <p className="text-sm font-medium">
                              {formatDateTime(ticket.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
