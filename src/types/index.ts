// Common type definitions used across the application

// Re-export types from other files if needed
export * from './global'

// Common utility types
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type Maybe<T> = T | null | undefined

// Common form types
export interface FormError {
  message: string
  field?: string
}

// API response types
export interface ApiResponse<T> {
  data: T | null
  error: Error | null
}

// Pagination types
export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Status types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// Event types (shared across multiple components)
export interface BaseEvent {
  event_id: number
  name: string
  description?: string
  start_time: string
  end_time: string
  image_url: string
  image_path?: string
}

// Venue types
export interface BaseVenue {
  venue_id: number
  venue_name: string
  venue_address?: string
  city?: string
  state?: string
}

// User types
export interface UserProfile {
  user_id: number
  email: string
  name?: string
  phone_number?: string
  phone_verified: boolean
  role: 'customer' | 'admin'
}