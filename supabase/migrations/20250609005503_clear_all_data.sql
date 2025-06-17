-- This script removes all data from user-defined tables and resets their ID sequences.
-- The CASCADE option ensures that all dependent tables are also truncated in the correct order.

TRUNCATE
  public.tickets,
  public.events_venues,
  public.events,
  public.venues,
  public.locations,
  public.users
RESTART IDENTITY CASCADE;
