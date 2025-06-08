-- Step 1: Re-create the events_venues table
CREATE TABLE public.events_venues (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    event_id BIGINT NOT NULL,
    venue_id BIGINT NOT NULL,
    no_of_tickets INT,
    event_venue_date DATE,
    CONSTRAINT fk_event
        FOREIGN KEY(event_id)
        REFERENCES public.events(event_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_venue
        FOREIGN KEY(venue_id)
        REFERENCES public.venues(venue_id)
        ON DELETE CASCADE
);

-- Enable RLS for the new table
ALTER TABLE public.events_venues ENABLE ROW LEVEL SECURITY;

-- Step 2: Remove the incorrect foreign key column from the events table
ALTER TABLE public.events
DROP COLUMN venue_id;
