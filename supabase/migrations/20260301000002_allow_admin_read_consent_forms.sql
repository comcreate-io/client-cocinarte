-- Allow all authenticated users to read consent forms
-- The admin dashboard is protected by application-level admin checks
CREATE POLICY "Authenticated users can read all consent forms"
  ON consent_forms
  FOR SELECT
  TO authenticated
  USING (true);
