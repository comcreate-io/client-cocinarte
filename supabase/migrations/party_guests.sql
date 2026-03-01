-- Party Guest Enrollment System Migration
-- Run this in Supabase SQL Editor

-- 1. Add dashboard_token to party_requests
ALTER TABLE party_requests ADD COLUMN IF NOT EXISTS dashboard_token UUID UNIQUE DEFAULT gen_random_uuid();
UPDATE party_requests SET dashboard_token = gen_random_uuid() WHERE dashboard_token IS NULL;
ALTER TABLE party_requests ALTER COLUMN dashboard_token SET NOT NULL;

-- 2. Create party_guests table
CREATE TABLE IF NOT EXISTS party_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_request_id UUID NOT NULL REFERENCES party_requests(id) ON DELETE CASCADE,
  child_name TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  form_token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  guest_child_id UUID REFERENCES guest_children(id),
  form_completed_at TIMESTAMPTZ,
  email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_party_guests_party_request_id ON party_guests(party_request_id);
CREATE INDEX IF NOT EXISTS idx_party_guests_form_token ON party_guests(form_token);
CREATE INDEX IF NOT EXISTS idx_party_guests_parent_email ON party_guests(parent_email);

-- 4. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_party_guests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER party_guests_updated_at
  BEFORE UPDATE ON party_guests
  FOR EACH ROW
  EXECUTE FUNCTION update_party_guests_updated_at();

-- 5. RLS policies
ALTER TABLE party_guests ENABLE ROW LEVEL SECURITY;

-- Public can select and insert (for form submissions and dashboard access)
CREATE POLICY "party_guests_public_select" ON party_guests
  FOR SELECT TO anon USING (true);

CREATE POLICY "party_guests_public_insert" ON party_guests
  FOR INSERT TO anon WITH CHECK (true);

-- Authenticated users have full access
CREATE POLICY "party_guests_auth_all" ON party_guests
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Service role bypasses RLS automatically

-- 6. Allow public update on party_guests (for form completion)
CREATE POLICY "party_guests_public_update" ON party_guests
  FOR UPDATE TO anon USING (true) WITH CHECK (true);
