// Generated from database schema analysis
export interface DatabaseUser {
  user_id: number;
  address1?: string;
  address2?: string;
  address3?: string;
  location_id?: number;
  created_at: string;
  updated_at: string;
  supabase_id?: string;
  role: "customer" | "admin";
  name?: string;
  email?: string;
  phone_number?: string;
  phone_verified?: boolean;
}

export interface DatabaseEvent {
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

export interface DatabaseVenue {
  venue_id: number;
  venue_name: string;
  venue_address?: string;
  location_id: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseLocation {
  location_id: number;
  created_at: string;
  city: string;
  state: string;
  pincode: string;
  area: string;
}

export interface DatabaseEventVenue {
  event_venue_id: number;
  event_id: number;
  venue_id: number;
  no_of_tickets?: number;
  event_venue_date?: string;
  price: number;
}

export interface DatabaseTicket {
  ticket_id: number;
  customer_id: number;
  created_at: string;
  updated_at: string;
  ticket_price: number;
  event_venue_id?: number;
  quantity: number; // Added by migration
}

// Join types for queries
export interface TicketWithDetails {
  ticket_id: number;
  customer_id: number;
  created_at: string;
  updated_at: string;
  ticket_price: number;
  event_venue_id?: number;
  quantity: number;
  events_venues?: DatabaseEventVenue & {
    events?: DatabaseEvent;
    venues?: DatabaseVenue & {
      locations?: DatabaseLocation;
    };
  };
}

// API response types
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
    city?: string;
    area?: string;
    state?: string;
  };
}

// Foreign key relationships in Supabase format
export type ForeignKeyRelationships = {
  tickets: {
    event_venue_id: "events_venues";
    customer_id: "users";
  };
  events_venues: {
    event_id: "events";
    venue_id: "venues";
  };
  venues: {
    location_id: "locations";
  };
  users: {
    location_id: "locations";
  };
};
