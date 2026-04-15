-- Add request_type to distinguish birthday parties from private events
ALTER TABLE party_requests
  ADD COLUMN IF NOT EXISTS request_type text NOT NULL DEFAULT 'birthday_party'
    CHECK (request_type IN ('birthday_party', 'private_event'));

-- Add private-event-specific fields
ALTER TABLE party_requests
  ADD COLUMN IF NOT EXISTS event_type text,
  ADD COLUMN IF NOT EXISTS preferred_time text,
  ADD COLUMN IF NOT EXISTS selected_menu text,
  ADD COLUMN IF NOT EXISTS dietary_restrictions text;

-- Index on request_type for filtering
CREATE INDEX IF NOT EXISTS idx_party_requests_request_type ON party_requests(request_type);
