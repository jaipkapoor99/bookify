# Booking Platform

A modern, scalable booking platform built with React and Supabase. This application provides a seamless experience for users to book tickets and a powerful admin portal for easy management.

## Features

- **User Authentication**: Secure sign-up and login functionality.
- **Ticket Booking**: A user-friendly interface for browsing and booking tickets.
- **Admin Portal**: A dedicated dashboard for administrators to manage bookings, users, and available items.

## Tech Stack

- **Frontend**: React (via Vite)
- **Backend & Database**: Supabase
- **Styling**: (To be decided - e.g., Tailwind CSS)
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/jaipkapoor99/booking-platform.git
    cd booking-platform
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Set up Supabase:**

    - Create a `.env.local` file in the root of the project.
    - Add your Supabase Project URL and Anon Key to the `.env.local` file:
      ```env
      VITE_SUPABASE_URL=YOUR_SUPABASE_URL
      VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
      ```

4.  **Run the development server:**
    ```bash
    pnpm dev
    ```

## Database Schema

The database schema is managed via Supabase migrations and is located in the `supabase/migrations` directory.

## Contributing

Contributions are welcome! Please feel free to submit a pull request.
