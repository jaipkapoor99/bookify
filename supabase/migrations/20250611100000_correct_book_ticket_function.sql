create or replace function book_ticket(p_event_venue_id bigint)
returns void
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_venue_details record;
begin
  -- Step 1: Get the current user's ID
  select auth.uid() into v_user_id;

  if not exists (select 1 from public.users where id = v_user_id) then
    raise exception 'User not found in public.users';
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
  insert into public.tickets(user_id, events_venues_id)
  values (v_user_id, p_event_venue_id);

end;
$$; 