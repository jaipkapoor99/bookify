// Database Types - Generated from schema dump
// Based on the actual current database structure

export type Role = "customer" | "admin";

// Users table - note: NO email column exists in current schema
export interface User {
  user_id: number;
  address1?: string;
  address2?: string;
  location_id?: number;
  created_at: string;
  updated_at: string;
  supabase_id?: string;
  role: Role;
  name?: string;
}

// Events table
export interface Event {
  event_id: number;
  name: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
  image_path?: string;
}

// Locations table
export interface Location {
  location_id: number;
  created_at: string;
  city: string;
  state: string;
  pincode: string;
  area: string;
}

// Venues table
export interface Venue {
  venue_id: number;
  venue_name: string;
  venue_address?: string;
  location_id: number;
  created_at: string;
  updated_at: string;
}

// Events_venues table (junction table)
export interface EventVenue {
  event_venue_id: number;
  event_id: number;
  venue_id: number;
  no_of_tickets?: number;
  event_venue_date?: string;
  price: number;
}

// Tickets table - note: NO quantity column exists in current schema
export interface Ticket {
  ticket_id: number;
  customer_id: number;
  created_at: string;
  updated_at: string;
  ticket_price: number;
  events_venues_id?: number;
}

// Query result types for complex joins
export interface BookingQueryResult {
  ticket_id: number;
  ticket_price: number;
  created_at: string;
  customer_id: number;
  events_venues_id?: number;
  // Note: NO quantity field exists in current schema
  events_venues?: {
    event_venue_date?: string;
    price: number;
    no_of_tickets?: number;
    venues?: {
      venue_name: string;
      venue_address?: string;
      locations?: {
        pincode: string;
        city: string;
        state: string;
        area: string;
      };
    };
    events?: {
      name: string;
      description?: string;
      image_url?: string;
      image_path?: string;
    };
  };
}

// User lookup result (what we get from the users table)
export interface UserLookupResult {
  user_id: number;
  // Note: NO email column exists in current schema
  supabase_id?: string;
}
