# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2025-06-08

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
