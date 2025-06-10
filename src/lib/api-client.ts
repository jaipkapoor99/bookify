/**
 * API Client - Main Entry Point
 *
 * This file serves as the main entry point for all API operations.
 * It re-exports functionality from specialized modules for better organization:
 * - auth-client.ts: Authentication operations (login, logout, session management)
 * - database-client.ts: Database operations (CRUD, RPC calls)
 *
 * This approach provides:
 * - Single import point for backwards compatibility
 * - Separation of concerns for better maintainability
 * - Cleaner code organization
 */

// Re-export authentication functionality
export {
  // Types
  type ApiResponse,
  type User,
  type Session,
  type AuthResponse,

  // Functions
  authApi,
  getCurrentUser,
  getStoredSession,
  storeSession,
} from "./auth-client";

// Re-export database functionality
export { dbApi, setAuthToken, initializeDbAuth } from "./database-client";

// Maintain backwards compatibility - ensure database auth is initialized when this module is imported
import { initializeDbAuth } from "./database-client";

// Initialize database auth when module is loaded
initializeDbAuth();
