# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
