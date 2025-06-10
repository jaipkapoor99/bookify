// Database Types - Generated from current database schema
// Based on the actual live database structure (2025-06-11)

export type Role = "customer" | "admin";

// Locations table - ONLY pincode (NO city, state, area fields)
export interface Location {
  location_id: number;
  pincode: string;
  created_at: string;
  updated_at: string;
}

// Events table
export interface Event {
  event_id: number;
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  image_url?: string;
  image_path?: string;
  created_at: string;
  updated_at: string;
}

// Venues table - NO venue_address field
export interface Venue {
  venue_id: number;
  venue_name: string;
  location_id: number;
  created_at: string;
  updated_at: string;
}

// Events_venues table (junction table)
export interface EventVenue {
  event_venue_id: number;
  event_id: number;
  venue_id: number;
  event_venue_date: string; // date format: YYYY-MM-DD
  no_of_tickets: number;
  price: number; // in cents (e.g., 250000 = ₹2500.00)
  created_at: string;
  updated_at: string;
}

// Users table - HAS email field
export interface User {
  user_id: number;
  supabase_id?: string;
  name?: string;
  email?: string;
  address1?: string;
  address2?: string;
  address3?: string;
  location_id?: number;
  role: Role;
  created_at: string;
  updated_at: string;
}

// Tickets table - HAS quantity field
export interface Ticket {
  ticket_id: number;
  customer_id: number;
  event_venue_id: number;
  ticket_price: number; // in cents
  quantity: number;
  created_at: string;
  updated_at: string;
}

// Extended types with relationships for complex queries
export interface EventWithVenues extends Event {
  venues: VenueWithLocation[];
}

export interface VenueWithLocation extends Venue {
  location: Location;
}

export interface EventVenueWithDetails extends EventVenue {
  event: Event;
  venue: VenueWithLocation;
}

export interface TicketWithDetails extends Ticket {
  event_venue: EventVenueWithDetails;
}

// Booking query result (what we get from the get_my_bookings function)
export interface BookingQueryResult {
  ticket_id: number;
  customer_id: number;
  event_venue_id: number;
  ticket_price: number;
  quantity: number;
  created_at: string;
  updated_at: string;
  // Joined data from related tables
  events_venues?: {
    event_venue_date: string;
    price: number;
    no_of_tickets: number;
    events?: {
      name: string;
      description?: string;
      image_url?: string;
      image_path?: string;
      start_time: string;
      end_time: string;
    };
    venues?: {
      venue_name: string;
      locations?: {
        pincode: string;
      };
    };
  };
}

// Simplified booking details for UI display
export interface BookingDetails {
  ticket_id: number;
  ticket_price: number;
  quantity: number;
  created_at: string;
  event_name: string;
  venue_name: string;
  event_venue_date: string;
  total_price: number;
  location?: {
    pincode: string;
  };
}

// User lookup result (for internal user ID retrieval)
export interface UserLookupResult {
  user_id: number;
  supabase_id?: string;
}

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
