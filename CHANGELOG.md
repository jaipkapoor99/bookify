# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
