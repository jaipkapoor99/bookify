create or replace function book_ticket(p_event_venue_id bigint, p_user_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_user_id int;
  v_venue_details record;
begin
  -- Step 1: Get the internal user ID from the public.users table
  select user_id into v_user_id from public.users where supabase_id = p_user_id;

  if v_user_id is null then
    raise exception 'User not found.';
  end if;

  -- Step 2: Check for ticket availability and lock the row
  select * into v_venue_details from public.events_venues
  where id = p_event_venue_id for update;

  if v_venue_details.no_of_tickets <= 0 then
    raise exception 'No tickets available for this event.';
  end if;

  -- Step 3: Decrement the ticket count
  update public.events_venues
  set no_of_tickets = no_of_tickets - 1
  where id = p_event_venue_id;

  -- Step 4: Insert the new ticket
  insert into public.tickets(customer_id, events_venues_id, ticket_price)
  values (v_user_id, p_event_venue_id, 500); -- Placeholder price

end;
$$;
