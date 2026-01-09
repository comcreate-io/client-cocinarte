-- Migration to create consent_forms table for tracking parent consent signatures per child
-- Tracks social media/video consent and liability waiver with digital signatures

-- Create consent_forms table
CREATE TABLE IF NOT EXISTS consent_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE NOT NULL,

  -- Social Media & Video Consent
  social_media_consent BOOLEAN DEFAULT false,

  -- Liability Waiver Consent
  liability_consent BOOLEAN DEFAULT false,

  -- Signature data
  parent_name_signed VARCHAR(255) NOT NULL,
  child_name_signed VARCHAR(255) NOT NULL,
  signature_url TEXT,
  signature_public_id TEXT,

  -- Form metadata
  form_version VARCHAR(50) DEFAULT '1.0',
  ip_address TEXT,
  user_agent TEXT,

  -- Dates
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_consent_forms_child_id ON consent_forms(child_id);
CREATE INDEX IF NOT EXISTS idx_consent_forms_parent_id ON consent_forms(parent_id);
CREATE INDEX IF NOT EXISTS idx_consent_forms_signed_at ON consent_forms(signed_at);
CREATE INDEX IF NOT EXISTS idx_consent_forms_social_media ON consent_forms(social_media_consent);
CREATE INDEX IF NOT EXISTS idx_consent_forms_liability ON consent_forms(liability_consent);

-- Unique constraint: one active consent form per child (latest is current)
-- We keep history by having multiple records, but only the latest counts

-- Updated at trigger (drop first if exists)
DROP TRIGGER IF EXISTS update_consent_forms_updated_at ON consent_forms;
CREATE TRIGGER update_consent_forms_updated_at
    BEFORE UPDATE ON consent_forms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE consent_forms ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read consent forms for their children
CREATE POLICY "Parents can read their children's consent forms"
  ON consent_forms
  FOR SELECT
  TO authenticated
  USING (
    parent_id IN (
      SELECT id FROM parents WHERE user_id = auth.uid()
    )
  );

-- Policy: Allow authenticated users to insert consent forms for their children
CREATE POLICY "Parents can insert consent forms for their children"
  ON consent_forms
  FOR INSERT
  TO authenticated
  WITH CHECK (
    parent_id IN (
      SELECT id FROM parents WHERE user_id = auth.uid()
    )
  );

-- Policy: Allow authenticated users to update consent forms for their children
CREATE POLICY "Parents can update their children's consent forms"
  ON consent_forms
  FOR UPDATE
  TO authenticated
  USING (
    parent_id IN (
      SELECT id FROM parents WHERE user_id = auth.uid()
    )
  );

-- Policy: Allow service role full access (for admin operations)
CREATE POLICY "Service role has full access to consent forms"
  ON consent_forms
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE consent_forms IS 'Stores parent consent forms and signatures for each child';
COMMENT ON COLUMN consent_forms.social_media_consent IS 'Whether parent allows photos/videos for social media and marketing';
COMMENT ON COLUMN consent_forms.liability_consent IS 'Whether parent has signed the cooking program liability waiver';
COMMENT ON COLUMN consent_forms.signature_url IS 'Cloudinary URL of the uploaded signature image';
COMMENT ON COLUMN consent_forms.signature_public_id IS 'Cloudinary public_id for managing the signature image';
COMMENT ON COLUMN consent_forms.revoked_at IS 'If set, this consent has been revoked by the parent';
COMMENT ON COLUMN consent_forms.form_version IS 'Version of the consent form signed, for tracking form updates';
