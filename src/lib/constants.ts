// =============================================
// BOOKING PLATFORM CONSTANTS
// Centralized storage for all constants used throughout the app
// =============================================
//
// BENEFITS:
// - Eliminates hardcoded strings scattered throughout the codebase
// - Makes refactoring easier (change once, update everywhere)
// - Reduces typos and improves maintainability
// - Provides IntelliSense/autocomplete for constants
// - Enables type safety with `as const` assertions
//
// USAGE:
// import { TABLES, COLUMNS, API_ENDPOINTS } from '@/lib/constants';
// dbApi.select(TABLES.USERS, COLUMNS.USERS.EMAIL, {...});
//
// =============================================

// ==================
// DATABASE TABLE NAMES
// ==================
export const TABLES = {
  USERS: "users",
  TICKETS: "tickets",
  EVENTS: "events",
  VENUES: "venues",
  LOCATIONS: "locations",
  EVENTS_VENUES: "events_venues",
} as const;

// ==================
// DATABASE COLUMN NAMES
// ==================
export const COLUMNS = {
  // Users table
  USERS: {
    USER_ID: "user_id",
    SUPABASE_ID: "supabase_id",
    NAME: "name",
    EMAIL: "email",
    PHONE_NUMBER: "phone_number",
    PHONE_VERIFIED: "phone_verified",
    ROLE: "role",
    ADDRESS1: "address1",
    ADDRESS2: "address2",
    ADDRESS3: "address3",
    LOCATION_ID: "location_id",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
  },

  // Tickets table
  TICKETS: {
    TICKET_ID: "ticket_id",
    CUSTOMER_ID: "customer_id",
    TICKET_PRICE: "ticket_price",
    QUANTITY: "quantity",
    EVENT_VENUE_ID: "event_venue_id",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
  },

  // Events table
  EVENTS: {
    EVENT_ID: "event_id",
    NAME: "name",
    DESCRIPTION: "description",
    START_TIME: "start_time",
    END_TIME: "end_time",
    IMAGE_URL: "image_url",
    IMAGE_PATH: "image_path",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
  },

  // Venues table
  VENUES: {
    VENUE_ID: "venue_id",
    VENUE_NAME: "venue_name",
    VENUE_ADDRESS: "venue_address",
    LOCATION_ID: "location_id",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
  },

  // Locations table
  LOCATIONS: {
    LOCATION_ID: "location_id",
    CITY: "city",
    STATE: "state",
    PINCODE: "pincode",
    AREA: "area",
    CREATED_AT: "created_at",
  },

  // Events_venues table
  EVENTS_VENUES: {
    EVENT_VENUE_ID: "event_venue_id",
    EVENT_ID: "event_id",
    VENUE_ID: "venue_id",
    NO_OF_TICKETS: "no_of_tickets",
    EVENT_VENUE_DATE: "event_venue_date",
    PRICE: "price",
  },
} as const;

// ==================
// QUERY COLUMN SETS
// Common column selections for database queries
// ==================
export const QUERY_COLUMNS = {
  USERS_PROFILE: `${COLUMNS.USERS.USER_ID},${COLUMNS.USERS.SUPABASE_ID}`,
  USERS_FULL: "*",

  TICKETS_BASIC: `${COLUMNS.TICKETS.TICKET_ID},${COLUMNS.TICKETS.TICKET_PRICE},${COLUMNS.TICKETS.CREATED_AT},${COLUMNS.TICKETS.CUSTOMER_ID},${COLUMNS.TICKETS.QUANTITY},${COLUMNS.TICKETS.EVENT_VENUE_ID}`,

  EVENTS_VENUES_BASIC: `${COLUMNS.EVENTS_VENUES.EVENT_VENUE_ID},${COLUMNS.EVENTS_VENUES.EVENT_VENUE_DATE},${COLUMNS.EVENTS_VENUES.PRICE},${COLUMNS.EVENTS_VENUES.VENUE_ID},${COLUMNS.EVENTS_VENUES.EVENT_ID}`,

  VENUES_BASIC: `${COLUMNS.VENUES.VENUE_ID},${COLUMNS.VENUES.VENUE_NAME},${COLUMNS.VENUES.LOCATION_ID}`,

  EVENTS_BASIC: `${COLUMNS.EVENTS.EVENT_ID},${COLUMNS.EVENTS.NAME},${COLUMNS.EVENTS.IMAGE_URL},${COLUMNS.EVENTS.IMAGE_PATH}`,

  LOCATIONS_BASIC: `${COLUMNS.LOCATIONS.LOCATION_ID},${COLUMNS.LOCATIONS.PINCODE}`,
} as const;

// ==================
// API ENDPOINTS
// ==================
export const API_ENDPOINTS = {
  AUTH: {
    TOKEN: "/token",
    LOGOUT: "/logout",
    AUTHORIZE: "/auth/v1/authorize",
  },
  FUNCTIONS: {
    GET_LOCATION_FROM_PINCODE: "/functions/v1/get-location-from-pincode",
    BOOK_TICKET: "/functions/v1/book_ticket",
  },
} as const;

// ==================
// ENVIRONMENT VARIABLES
// ==================
export const ENV_VARS = {
  SUPABASE_URL: "VITE_SUPABASE_URL",
  SUPABASE_ANON_KEY: "VITE_SUPABASE_ANON_KEY",
  NODE_ENV: "NODE_ENV",
  MODE: "MODE",
  DEBUG: "DEBUG",
} as const;

// ==================
// LOCAL STORAGE KEYS
// ==================
export const STORAGE_KEYS = {
  SESSION: "booking-platform-session",
} as const;

// ==================
// ROUTES
// ==================
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  MY_BOOKINGS: "/my-bookings",
  EVENT_DETAIL: "/events/:id",
  AUTH_CALLBACK: "/auth/callback",
  BOOKING_CONFIRMATION: "/booking-confirmation",
} as const;

// ==================
// USER ROLES
// ==================
export const USER_ROLES = {
  CUSTOMER: "customer",
  ADMIN: "admin",
} as const;

// ==================
// HTTP STATUS CODES
// ==================
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// ==================
// OAUTH PROVIDERS
// ==================
export const OAUTH_PROVIDERS = {
  GOOGLE: "google",
} as const;

// ==================
// API TIMEOUTS (in milliseconds)
// ==================
export const TIMEOUTS = {
  DEFAULT_API: 10000, // 10 seconds
  LOCATION_API: 10000, // 10 seconds
  AUTH_REQUEST: 15000, // 15 seconds
} as const;

// ==================
// DEFAULT VALUES
// ==================
export const DEFAULTS = {
  USER_NAME: "User",
  PAGINATION_LIMIT: 50,
  SESSION_REFRESH_BUFFER: 300, // 5 minutes in seconds
} as const;

// ==================
// ERROR MESSAGES
// ==================
export const ERROR_MESSAGES = {
  NO_SESSION: "No session found",
  SESSION_EXPIRED: "Session expired",
  NETWORK_ERROR: "Network error",
  DATABASE_ERROR: "Database error",
  UNAUTHORIZED: "Unauthorized access",
  USER_NOT_FOUND: "User not found",
  PROFILE_CREATION_FAILED: "Failed to create user profile",
  BOOKING_FAILED: "Booking failed",
  LOCATION_FETCH_FAILED: "Failed to fetch location",
} as const;

// ==================
// SUCCESS MESSAGES
// ==================
export const SUCCESS_MESSAGES = {
  PROFILE_CREATED: "Successfully created user profile",
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logout successful",
  BOOKING_SUCCESS: "Booking successful",
} as const;

// ==================
// POSTGREST ERROR CODES
// ==================
export const POSTGREST_ERRORS = {
  NO_ROWS: "PGRST116", // No rows returned
} as const;
