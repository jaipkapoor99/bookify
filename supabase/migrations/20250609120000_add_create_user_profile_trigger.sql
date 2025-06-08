-- Function to create a new user profile
create function public.create_user_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (supabase_id, email)
  values (new.id, new.email);
  return new;
end;
$$;

-- Trigger to call the function on new user sign-up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_user_profile(); 