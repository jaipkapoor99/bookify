# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.3] - 2025-01-17

### 🔧 Critical Module Resolution & Vite Configuration Fixes

#### Fixed

- **🚨 Supabase Module Import Error**: Resolved critical ESM/CommonJS compatibility issue preventing application startup

  - **Error**: `Uncaught SyntaxError: The requested module '/node_modules/@supabase/postgrest-js/dist/cjs/index.js?v=7ffe7cc6' does not provide an export named 'default'`
  - **Solution**: Updated Vite configuration to include Supabase dependencies in `optimizeDeps.include`
  - **Impact**: Application now starts successfully in development mode

- **🧪 Test Environment Compatibility**: Fixed HTMLCanvasElement errors in JSDOM test environment

  - Enhanced `checkWebPSupport` function with proper try-catch error handling
  - Added graceful fallbacks for browser features not available in test environments
  - Resolved multiple integration test failures

- **📝 TypeScript Type Safety**: Eliminated unsafe 'any' types and improved generic type usage
  - Fixed performance monitor type assertions for PerformanceEntry objects
  - Enhanced smart lazy loading with proper generic type syntax
  - Improved overall type safety across the codebase

#### Changed

- **⚙️ Vite Configuration Optimization**: Enhanced dependency pre-bundling strategy

  ```typescript
  optimizeDeps: {
    include: [
      "react", "react-dom", "react-router-dom",
      "@supabase/supabase-js", "@supabase/postgrest-js",
      "@supabase/realtime-js", "@supabase/storage-js", "@supabase/gotrue-js"
    ],
    exclude: ["lucide-react"], // Only exclude truly large dependencies
    esbuildOptions: { target: "esnext" },
  }
  ```

- **🌐 ESM Compatibility**: Added global definitions for better module resolution
  ```typescript
  define: {
    global: "globalThis";
  }
  ```

#### Technical Improvements

- **🚀 Development Performance**: Faster development server startup with optimized dependency bundling
- **🛡️ Error Resilience**: Enhanced error handling and fallback mechanisms
- **🧪 Test Reliability**: Improved test environment compatibility and stability
- **📊 Code Quality**: Maintained 0 linting errors with 67/67 tests passing

### 🎯 Impact Summary

- **Startup Reliability**: Application now starts consistently without module resolution errors
- **Development Experience**: Faster hot reload and better error messages
- **Test Stability**: All tests pass reliably across different environments
- **Type Safety**: Enhanced TypeScript coverage with proper generic types

## [1.6.2] - 2025-01-17

### 🎯 UX Improvements & Bug Fixes

#### Fixed

- **💰 Total Price Calculation**: Fixed critical bug in My Bookings page where total amount displayed only the per-ticket price instead of the correct total (ticket_price × quantity)
  - Total calculation now correctly multiplies ticket price by quantity
  - Example: 2 tickets × ₹2,500 now correctly shows ₹5,000 instead of ₹2,500
  - Updated test suite to validate the correct calculation

#### Added

- **🖱️ Pointer Cursor Styling**: Enhanced user interface with appropriate cursor feedback for interactive elements
  - Added `cursor-pointer` to all clickable cards (events, venues, bookings)
  - Added `cursor-pointer` to hoverable images with transform effects
  - Added `cursor-not-allowed` for disabled/sold-out venues
  - Improved user experience with consistent visual feedback across the application

#### Technical Improvements

- **🧪 Test Suite Updates**: Maintained comprehensive test coverage
  - Updated MyBookingsPage tests to expect correct total amount calculations
  - All 67 tests passing with zero failures
  - Clean TypeScript compilation with no linting errors

### 🎯 Impact Summary

- **User Experience**: Clear visual feedback for all interactive elements
- **Data Accuracy**: Correct total price calculations in booking summaries
- **Code Quality**: Maintained perfect test coverage and clean codebase

## [1.6.1] - 2025-01-17

### 🔧 Session Persistence Fix

#### Fixed

- **🔐 Page Refresh Authentication Issue**: Resolved critical bug where protected routes (like `/my-bookings`) redirected users to login page on refresh despite valid authentication
  - Fixed hardcoded `loading: false` in AuthContext that caused premature authentication checks
  - Implemented proper loading state management during session restoration
  - Added loading indicators to prevent user confusion during session validation
- **⏰ Session Expiry Validation**: Enhanced session expiry detection and handling
  - Added robust timestamp vs duration detection for session expiry validation
  - Improved session cleanup for corrupted or expired sessions
  - Prevents authentication bypass with malformed session data

#### Added

- **📖 Comprehensive Testing Strategy Documentation**: Complete testing documentation overhaul
  - Detailed session persistence testing patterns and examples
  - Test-Driven Development (TDD) workflow documentation
  - Performance testing guidelines and benchmarks
  - Error handling and edge case testing strategies
- **🧪 Enhanced Test Coverage**: Expanded session management test suite
  - Added comprehensive session persistence testing
  - Improved integration tests for authentication flows
  - Enhanced AuthContext unit tests with edge case coverage
  - Maintained 66/66 tests passing with zero linter errors

#### Technical Improvements

- **🔄 Session Management Architecture**: Improved session restoration flow
  - Proper async session initialization with loading states
  - Enhanced error handling for network failures and corrupted sessions
  - Better separation of concerns between auth client and context layers
- **📊 Testing Excellence**: Advanced testing patterns implementation
  - User-centric testing approach focusing on behavior over implementation
  - Comprehensive mocking strategies for external dependencies
  - Performance benchmarking with sub-1000ms render time targets

### 🎯 Impact Summary

- **User Experience**: No more unexpected login redirects on page refresh
- **Reliability**: Robust session management with proper error handling
- **Testing**: Comprehensive test coverage ensuring stability
- **Documentation**: Complete testing strategy for future development

## [1.6.0] - 2025-01-17

### 🚀 Major Performance & Architecture Overhaul

#### Added

- **⚡ Instant Booking Performance**: Revolutionary performance improvements to MyBookingsPage
  - Eliminated 3-second loading delays completely
  - Booking data now loads in ~0ms through AuthContext pre-loading
  - Auto-refresh functionality - new bookings appear instantly without manual refresh
- **🏗️ Modular API Client Architecture**: Complete refactoring of the API layer

  - Split monolithic `api-client.ts` (437 lines) into focused modules:
    - `auth-client.ts` (195 lines) - Pure authentication operations
    - `database-client.ts` (220 lines) - Pure database operations
    - `api-client.ts` (35 lines) - Clean re-export facade
  - Zero breaking changes - all existing imports continue to work
  - Better maintainability with single responsibility per module
  - Comprehensive documentation in `src/lib/README.md`

- **🎨 Enhanced MyBookingsPage UI**: Complete visual overhaul
  - Beautiful card-based layout with event images
  - Added visual icons (Calendar, MapPin, Ticket) for better hierarchy
  - Responsive design with improved typography
  - Large event images (64x48 on desktop, full width on mobile)
  - Better spacing and modern aesthetic

#### Fixed

- **🖼️ Image Loading Issues**: Resolved StorageImage component problems

  - Fixed handling of both external URLs (Unsplash) and Supabase storage paths
  - Proper error handling and fallback support
  - Images now display correctly across all components

- **📍 Pincode API Integration**: Fixed location data fetching

  - Corrected environment variable access (`import.meta.env` vs `process.env`)
  - Added proper Authorization headers for Supabase Edge Functions
  - Enhanced error handling with fallback to database location data

- **🧪 Test Suite Updates**: Comprehensive test fixes
  - Updated MyBookingsPage tests for new AuthContext architecture
  - Replaced local API mocks with AuthContext mocks
  - Fixed duplicate event names in test data
  - All tests now pass with proper isolation

#### Changed

- **📊 AuthContext Architecture**: Major state management improvements

  - Extended AuthContext with booking-specific state:
    - `bookings`, `loadingBookings`, `bookingsError`
    - `locationDetails`, `refreshBookings()`
  - Moved 460+ lines of booking logic from MyBookingsPage to AuthContext
  - Automatic booking data fetch when user profile loads
  - Proper cleanup when user logs out
  - Simplified MyBookingsPage from 561 to 27 lines of logic

- **🔄 Performance Optimizations**: Multiple performance enhancements
  - Smart pre-loading of booking data during authentication
  - Intelligent caching with automatic invalidation
  - Reduced API calls through centralized state management

#### Technical Improvements

- **📝 Enhanced Documentation**: New modular API architecture documentation

  - Migration guide for developers
  - Architecture principles and benefits
  - Clear separation of concerns explanation
  - Backwards compatibility guarantees

- **✅ Code Quality**: Maintained zero linter errors
  - Clean, consistent codebase throughout refactoring
  - Type safety preserved across all modules
  - Comprehensive error handling

### 🎯 Impact Summary

- **Performance**: 3000ms+ → ~0ms booking load time
- **Code Quality**: 437-line monolithic file → 3 focused modules
- **User Experience**: Instant booking data with beautiful UI
- **Maintainability**: Clear separation of concerns for long-term growth
- **Testing**: Updated test suite with better isolation and coverage

## [1.5.0] - 2025-01-16

### Added

- **Brand Identity**: Established "Bookify" as the official product name and brand
- **Comprehensive Documentation**: Complete documentation overhaul with enterprise-grade guides
  - New API Documentation with database schema and query patterns
  - Production Deployment Guide for multiple platforms
  - System Architecture Documentation with design decisions
  - Enhanced README with modern structure and visual design

### Changed

- **Project Name**: Rebranded from "Event Booking Platform" to "Bookify"
- **HTML Title**: Updated to "Bookify - Book Tickets for Amazing Events"
- **Package Information**: Updated package.json with new name, version, and description
- **Documentation**: Updated all documentation files to reflect Bookify branding
- **Version**: Bumped to v1.5.0 to reflect the maturity and documentation completeness

## [1.4.0] - 2025-06-15

### Added

- **Account Management Page**: Created a new `AccountPage` where authenticated users can manage their personal information.
- **Update User Name**: Implemented functionality for users to add or update their full name. The UI now displays this name in the header.
- **Update User Phone**: Implemented functionality for users to add and verify their phone number using OTP.
- **Google OAuth**: Added a "Sign in with Google" option on the login page for a streamlined authentication experience.

### Changed

- **Protected Routes**: Refactored the main router to group all authenticated routes (`/my-bookings`, `/account`, etc.) under a single `ProtectedRoute` component for better security and organization.
- **UI Display**: The main layout now displays the user's full name in the header if available, falling back to their email address.

## [1.3.0] - 2025-06-14

### Added

- **Booking Confirmation Page**: Created a new page (`/book/confirm/:eventVenueId`) where users can review booking details (event, venue, date, price) before finalizing their purchase.
- **My Bookings Page**: Implemented the "My Bookings" page (`/my-bookings`) to display a list of all tickets a user has purchased.
- **Test Coverage**: Added comprehensive test suites for the `BookingConfirmationPage` and `MyBookingsPage`, ensuring the booking and ticket viewing flows are robust and reliable.

### Fixed

- **Comprehensive Data Fetching Overhaul**:
  - Resolved a persistent and complex bug where bookings were not appearing on the "My Bookings" page. The final solution involved refactoring the data access logic to use a `SECURITY DEFINER` RPC function (`get_my_bookings`), which provides a more robust and secure way to fetch user-specific data.
  - Corrected numerous Row Level Security (RLS) configuration issues across `events`, `venues`, `locations`, `events_venues`, and `tickets` tables, including enabling RLS and creating the correct public-read and user-specific policies.
  - Standardized all frontend queries (`EventDetailPage`, `BookingConfirmationPage`, `MyBookingsPage`) to use `!inner` joins, simplifying the code, flattening the data structure, and ensuring relationships are handled correctly.
- **UI Components**: Added the `Alert` component from `shadcn/ui` and populated its file, resolving module import errors.

### Changed

- **Database Schema**: Added a `price` column to the `events_venues` table to store the cost of a ticket for a specific event at a specific venue.
- **Location Data Architecture**: Refactored the application to fetch location data (city, state, area) from a new Supabase Edge Function (`get-location-from-pincode`) instead of storing it in the database. The `locations` table now only stores the `pincode`.

## [1.2.0] - 2025-06-12

### Fixed

- **Database Schema & Migrations**: Resolved numerous critical inconsistencies between local migration files and the remote database state. This involved repairing the migration history, correcting table and column definitions, and ensuring all migrations are idempotent.
- **Ticket Booking Logic**: Completely rewrote the `book_ticket` RPC function to correctly handle user lookups, foreign key relationships (`events_venues_id`, `customer_id`), and ticket availability checks.
- **User Signup Flow**:
  - Corrected the `create_user_profile` trigger to successfully create a corresponding record in `public.users` after a new user signs up in `auth.users`.
  - Refactored the `SignupPage` component to prevent automatic login after signup. The user is now correctly shown a confirmation message and redirected to the login page.
- **Environment Loading**: Resolved a critical application crash by adding instructions for the creation and use of the `.env.local` file to provide the necessary Supabase environment variables.

### Changed

- The signup process no longer uses a custom Edge Function or an intermediate session-less client, relying instead on a properly configured Supabase client and backend trigger.

## [1.1.0] - 2025-06-10

### Added

- **Core Booking Logic**: Implemented the `book_ticket` PostgreSQL function, which securely handles the ticket booking process within a transaction. This includes checking ticket availability, decrementing the ticket count, and creating a new ticket record.
- **Ticket Security**: Added a new Row Level Security policy to the `tickets` table to ensure that users can only create bookings for themselves.

### Changed

- The "Book Tickets" button on the `EventDetailPage` now calls the `book_ticket` RPC function, connecting the frontend to the new backend logic.

## [1.0.1] - 2025-06-08

### Added

- **Authenticated Action**: Implemented logic for the "Book Tickets" button on the `EventDetailPage`. Unauthenticated users are now redirected to the login page, while authenticated users see a placeholder action.
- **Test Coverage**: Added a new test case to verify the redirection logic for unauthenticated users, ensuring the feature is robust and reliable.

### Fixed

- **Missing RLS Policy**: Added a read-access RLS policy to the `events_venues` table, fixing a critical bug where venue and date information was not being displayed on the event detail page.

## [1.0.0] - 2025-06-08

### Fixed

- **Corrected Data Model**: Overhauled the database schema to correctly implement a many-to-many relationship between `events` and `venues` using the `events_venues` join table. This fixes the core architectural flaw where an event was incorrectly limited to a single venue.
- **Fixed Event Detail Page**: Refactored the `EventDetailPage` to fetch and display multiple venues and dates for a single event, resolving the critical runtime bug that caused the page to crash.
- **Updated Test Suite**: Rewritten the entire test file for `EventDetailPage` to align with the new data model and UI logic, ensuring our test coverage is accurate and robust.
- **Resolved Linter Errors**: Cleaned up all linter errors that were introduced during the refactoring process, bringing the project to a clean, passing state.
- **Restored Seed Data**: Corrected the `seed.sql` file to populate the restored `events_venues` table, ensuring the database is seeded with valid, relational data.

### Added

- **Richer Event Detail UI**: The `EventDetailPage` now features a list of dates and venues for each event, with "Book Tickets" buttons for each entry.

### Changed

- **Database Migrations**: Created new migrations to drop the incorrect `venue_id` column from `events` and to re-create the `events_venues` table with the proper foreign key constraints.

---

### Previous "Unreleased" Changes

### Added

- Initial project setup with Vite and React.
- Integrated Supabase for database and authentication.
- Created initial database schema and seed data.
- Added `README.md` and `CHANGELOG.md`.
- Configured Vitest and React Testing Library for component testing.
- Implemented frontend routing using `react-router-dom`.
- Created a basic layout and a home page to display events.
- Fetched and displayed events from Supabase on the home page.
- Added `shadcn/ui` Card component for a basic event list UI.
- Implemented a full authentication flow with login, signup, and session management using a React Context.
- Added dynamic Login/Signup/Logout buttons to the main layout.

### Changed

- Refactored `HomePage` to use an `AbortController` for safer, cancellable data fetching.

### Fixed

- Corrected broken image URLs and invalid date formats by cleaning and re-seeding the database.
- Enabled and configured Row Level Security (RLS) policies for all tables.
- Resolved various data fetching and rendering bugs on the home page.
- Fixed `act` warnings across the test suite by using `waitFor` to handle asynchronous state updates correctly.
- Improved test reliability by replacing `vi.clearAllMocks()` with `vi.resetAllMocks()` to prevent mock state from leaking between tests.
- Corrected TypeScript module resolution errors related to path aliases by updating `tsconfig.app.json` and fixing import paths.
