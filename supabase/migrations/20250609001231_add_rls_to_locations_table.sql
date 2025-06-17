CREATE POLICY "Enable read access for all users" ON "public"."locations"
AS PERMISSIVE FOR SELECT
TO public
USING (true);
