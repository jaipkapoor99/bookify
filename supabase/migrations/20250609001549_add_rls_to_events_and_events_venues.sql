CREATE POLICY "Enable read access for all users on events" ON "public"."events"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable read access for all users on events_venues" ON "public"."events_venues"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

