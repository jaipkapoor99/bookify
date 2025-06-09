# API Documentation

This document provides comprehensive documentation for the Event Booking Platform's backend API, database functions, and data structures.

## 🌐 Overview

The backend is powered by Supabase, providing:

- **PostgreSQL Database** with Row Level Security (RLS)
- **Authentication** via Supabase Auth
- **Storage** for event images
- **Edge Functions** for external API integration
- **Real-time subscriptions** (planned feature)

## 🔑 Authentication

All API calls require proper authentication through Supabase Auth. The frontend handles authentication automatically through the AuthContext.

### Authentication Methods

- **Email/Password**: Traditional signup and login
- **Google OAuth**: Social authentication integration
- **JWT Tokens**: Automatic token management via Supabase client

## 📊 Database Schema

### Core Tables

#### `users`

User profiles and account information.

```sql
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  supabase_id UUID REFERENCES auth.users(id),
  name TEXT,
  email TEXT,
  phone_number TEXT,
  phone_verified BOOLEAN DEFAULT false,
  address1 TEXT,
  address2 TEXT,
  address3 TEXT,
  location_id BIGINT REFERENCES locations(location_id),
  role user_role DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `events`

Event information and metadata.

```sql
CREATE TABLE events (
  event_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  image_path TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `venues`

Venue information and location details.

```sql
CREATE TABLE venues (
  venue_id SERIAL PRIMARY KEY,
  venue_name TEXT NOT NULL,
  venue_address TEXT,
  location_id BIGINT REFERENCES locations(location_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `events_venues`

Junction table linking events to venues with specific dates and pricing.

```sql
CREATE TABLE events_venues (
  event_venue_id BIGSERIAL PRIMARY KEY,
  event_id BIGINT REFERENCES events(event_id),
  venue_id BIGINT REFERENCES venues(venue_id),
  event_venue_date DATE,
  no_of_tickets INTEGER,
  price BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `tickets`

Booking records with quantity support.

```sql
CREATE TABLE tickets (
  ticket_id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES users(user_id),
  events_venues_id BIGINT REFERENCES events_venues(event_venue_id),
  quantity INTEGER NOT NULL DEFAULT 1,
  ticket_price BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `locations`

Location data with pincode integration.

```sql
CREATE TABLE locations (
  location_id BIGSERIAL PRIMARY KEY,
  pincode TEXT,
  area TEXT,
  city TEXT,
  state TEXT
);
```

### Enums

#### `user_role`

```sql
CREATE TYPE user_role AS ENUM ('customer', 'admin');
```

## 🔒 Row Level Security (RLS) Policies

### Users Table

```sql
-- Users can read their own profile
CREATE POLICY "Users can read their own profile" ON users
  FOR SELECT TO authenticated
  USING (supabase_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE TO authenticated
  USING (supabase_id = auth.uid())
  WITH CHECK (supabase_id = auth.uid());
```

### Events Table

```sql
-- Anyone can read events
CREATE POLICY "Anyone can read events" ON events
  FOR SELECT TO anon, authenticated
  USING (true);
```

### Tickets Table

```sql
-- Users can view their own tickets
CREATE POLICY "Users can view their own tickets" ON tickets
  FOR SELECT TO authenticated
  USING (customer_id IN (
    SELECT user_id FROM users WHERE supabase_id = auth.uid()
  ));
```

## 🔧 Database Functions

### `book_ticket(p_event_venue_id, p_quantity?)`

Books tickets for a specific event-venue combination.

**Parameters:**

- `p_event_venue_id` (BIGINT): The ID of the event-venue combination
- `p_quantity` (INTEGER, optional): Number of tickets to book (default: 1)

**Returns:** VOID

**Function Logic:**

1. Validates user authentication
2. Checks ticket availability
3. Updates ticket count
4. Creates ticket record

```sql
CREATE OR REPLACE FUNCTION book_ticket(
  p_event_venue_id BIGINT,
  p_quantity INTEGER DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_internal_user_id INT;
  v_venue_details RECORD;
BEGIN
  -- Get internal user ID
  SELECT user_id INTO v_internal_user_id
  FROM public.users
  WHERE supabase_id = auth.uid();

  IF v_internal_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found.';
  END IF;

  -- Get venue details and check availability
  SELECT event_venue_id, no_of_tickets, price
  INTO v_venue_details
  FROM public.events_venues
  WHERE event_venue_id = p_event_venue_id;

  IF v_venue_details.event_venue_id IS NULL THEN
    RAISE EXCEPTION 'Event venue not found.';
  END IF;

  IF v_venue_details.no_of_tickets < p_quantity THEN
    RAISE EXCEPTION 'Not enough tickets available. Only % remaining.',
                   v_venue_details.no_of_tickets;
  END IF;

  -- Update ticket count
  UPDATE public.events_venues
  SET no_of_tickets = no_of_tickets - p_quantity
  WHERE event_venue_id = p_event_venue_id;

  -- Create ticket record
  INSERT INTO public.tickets(customer_id, events_venues_id, ticket_price, quantity)
  VALUES (v_internal_user_id, p_event_venue_id, v_venue_details.price, p_quantity);
END;
$$;
```

### `get_my_bookings()`

Retrieves all bookings for the currently authenticated user.

**Parameters:** None

**Returns:** SETOF tickets

```sql
CREATE OR REPLACE FUNCTION get_my_bookings()
RETURNS SETOF tickets
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM public.tickets
  WHERE customer_id IN (
    SELECT user_id FROM public.users WHERE supabase_id = auth.uid()
  );
$$;
```

### `create_user_profile()`

Trigger function that creates a user profile when a new account is created.

**Trigger:** Fires after INSERT on `auth.users`

```sql
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (supabase_id, name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$;
```

## 🌐 Edge Functions

### `get-location-from-pincode`

Fetches location details from Indian postal pincode.

**Endpoint:** `/functions/v1/get-location-from-pincode`

**Method:** POST

**Request Body:**

```json
{
  "pincode": "110001"
}
```

**Response:**

```json
{
  "area": "Connaught Place",
  "city": "New Delhi",
  "state": "Delhi"
}
```

**Error Response:**

```json
{
  "error": "Invalid pincode provided."
}
```

## 📁 Supabase Storage

### Buckets

#### `event-images`

- **Purpose**: Store event images
- **Access**: Public read access
- **Upload restrictions**:
  - Max size: 5MB
  - Allowed types: JPEG, PNG, WebP

### File Operations

#### Upload Image

```typescript
const { data, error } = await supabase.storage
  .from("event-images")
  .upload(fileName, file, {
    cacheControl: "3600",
    upsert: false,
  });
```

#### Get Public URL

```typescript
const { data } = supabase.storage.from("event-images").getPublicUrl(path);
```

#### Delete Image

```typescript
const { error } = await supabase.storage.from("event-images").remove([path]);
```

## 📡 Frontend API Calls

### Common Query Patterns

#### Fetch Events with Venues

```typescript
const { data, error } = await supabase.from("events").select(`
    *,
    events_venues!inner(
      *,
      venues!inner(
        *,
        locations(*)
      )
    )
  `);
```

#### Fetch User's Bookings

```typescript
const { data, error } = await supabase.rpc("get_my_bookings").select(`
    *,
    events_venues!inner(
      event_venue_date,
      events!inner(name, image_url),
      venues!inner(venue_name)
    )
  `);
```

#### Book Tickets

```typescript
const { error } = await supabase.rpc("book_ticket", {
  p_event_venue_id: eventVenueId,
  p_quantity: quantity,
});
```

## 📊 Data Types

### Custom Types

#### `DatabaseUser`

```typescript
interface DatabaseUser {
  user_id: number;
  supabase_id?: string;
  name?: string;
  email?: string;
  phone_number?: string;
  phone_verified?: boolean;
  address1?: string;
  address2?: string;
  address3?: string;
  location_id?: number;
  role: "customer" | "admin";
  created_at: string;
  updated_at: string;
}
```

#### `Event`

```typescript
interface Event {
  event_id: number;
  name: string;
  description?: string;
  image_url?: string;
  image_path?: string;
  start_time?: string;
  end_time?: string;
  created_at: string;
  updated_at: string;
}
```

#### `Venue`

```typescript
interface Venue {
  venue_id: number;
  venue_name: string;
  venue_address?: string;
  location_id?: number;
  created_at: string;
  updated_at: string;
}
```

#### `EventVenue`

```typescript
interface EventVenue {
  event_venue_id: number;
  event_id: number;
  venue_id: number;
  event_venue_date?: string;
  no_of_tickets?: number;
  price: number;
  created_at: string;
}
```

#### `Ticket`

```typescript
interface Ticket {
  ticket_id: number;
  customer_id: number;
  events_venues_id?: number;
  quantity: number;
  ticket_price: number;
  created_at: string;
  updated_at: string;
}
```

## 🔧 Error Handling

### Common Error Responses

#### Authentication Errors

```json
{
  "error": "User not found.",
  "code": "USER_NOT_FOUND"
}
```

#### Booking Errors

```json
{
  "error": "Not enough tickets available. Only 2 remaining.",
  "code": "INSUFFICIENT_TICKETS"
}
```

#### Validation Errors

```json
{
  "error": "Invalid pincode provided.",
  "code": "INVALID_PINCODE"
}
```

## 🎯 Best Practices

### Query Optimization

1. Use `!inner` joins for required relationships
2. Select only needed columns with specific field lists
3. Implement proper indexing on frequently queried columns
4. Use RPC functions for complex business logic

### Security

1. Always use RLS policies for data access control
2. Validate input data on both client and server side
3. Use `SECURITY DEFINER` functions for privileged operations
4. Implement proper error handling without exposing sensitive data

### Caching

1. Implement client-side caching with TTL
2. Use Supabase real-time subscriptions for live updates
3. Cache static data like locations and venue information
4. Invalidate cache when data is modified

## 📈 Performance Considerations

### Database Indexes

Key indexes for optimal performance:

```sql
-- Composite index for event-venue queries
CREATE INDEX idx_events_venues_composite
ON events_venues(event_id, venue_id, event_venue_date);

-- Index for user lookups
CREATE INDEX idx_users_supabase_id ON users(supabase_id);

-- Index for ticket queries
CREATE INDEX idx_tickets_customer_id ON tickets(customer_id);
```

### Query Patterns

- Use pagination for large datasets
- Implement proper JOIN strategies
- Utilize database functions for complex operations
- Cache frequently accessed data

This API documentation provides a comprehensive guide to the backend architecture and can be extended as new features are added to the platform.
