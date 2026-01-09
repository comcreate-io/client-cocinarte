-- Email Marketing System Tables
-- Run this in Supabase SQL Editor to create the required tables

-- Email Contacts Table
CREATE TABLE IF NOT EXISTS email_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Sends Tracking Table
CREATE TABLE IF NOT EXISTS email_sends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES email_templates(id) ON DELETE CASCADE,
  contact_email TEXT NOT NULL,
  contact_name TEXT,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_contacts_email ON email_contacts(email);
CREATE INDEX IF NOT EXISTS idx_email_sends_template_id ON email_sends(template_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_contact_email ON email_sends(contact_email);

-- Enable Row Level Security (optional but recommended)
-- ALTER TABLE email_contacts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users (uncomment if using RLS)
-- CREATE POLICY "Allow all for authenticated users" ON email_contacts FOR ALL TO authenticated USING (true);
-- CREATE POLICY "Allow all for authenticated users" ON email_templates FOR ALL TO authenticated USING (true);
-- CREATE POLICY "Allow all for authenticated users" ON email_sends FOR ALL TO authenticated USING (true);
