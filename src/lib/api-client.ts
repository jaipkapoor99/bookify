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

// Re-export database functionality
export { dbApi } from "./database-client";

