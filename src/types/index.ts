// Main type definitions for the booking platform application
// Re-exports from all type files

// Re-export all database types
export * from "./database.types";
export * from "./global";

// Common utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// Common form types
export interface FormError {
  message: string;
  field?: string;
}

// Status types
export type LoadingState = "idle" | "loading" | "success" | "error";

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
}

// Legacy types for backward compatibility (DEPRECATED - use database.types.ts versions)
// These will be removed in a future version
export interface BaseEvent {
  event_id: number;
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  image_url: string;
  image_path?: string;
}

export interface BaseVenue {
  venue_id: number;
  venue_name: string;
  venue_address?: string;
  city?: string;
  state?: string;
}

export interface UserProfile {
  user_id: number;
  email: string;
  name?: string;
  phone_number?: string;
  phone_verified: boolean;
  role: "customer" | "admin";
}
