-- Add comprehensive child and parent information fields to students table

-- Child Information fields
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS child_full_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS child_age INTEGER,
  ADD COLUMN IF NOT EXISTS child_preferred_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS has_cooking_experience BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS cooking_experience_details TEXT;

-- Health & Safety fields
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS allergies TEXT,
  ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT,
  ADD COLUMN IF NOT EXISTS medical_conditions TEXT,
  ADD COLUMN IF NOT EXISTS emergency_medications TEXT,
  ADD COLUMN IF NOT EXISTS additional_notes TEXT;

-- Parent Information fields (enhanced)
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS parent_guardian_names TEXT,
  ADD COLUMN IF NOT EXISTS parent_phone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS parent_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS preferred_communication_method VARCHAR(50) DEFAULT 'email',
  ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR(100);

-- Pick-Up Information fields
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS authorized_pickup_persons TEXT,
  ADD COLUMN IF NOT EXISTS custody_restrictions TEXT;

-- Media & Photos field
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS media_permission BOOLEAN DEFAULT false;

-- Update existing child_name to be nullable since we now have child_full_name
ALTER TABLE students
  ALTER COLUMN child_name DROP NOT NULL;

-- Add comment to table
COMMENT ON TABLE students IS 'Comprehensive student and parent/guardian information for Cocinarte classes';

-- Add column comments for clarity
COMMENT ON COLUMN students.child_full_name IS 'Child''s full legal name';
COMMENT ON COLUMN students.child_age IS 'Child''s current age';
COMMENT ON COLUMN students.child_preferred_name IS 'Child''s preferred name or nickname for class';
COMMENT ON COLUMN students.has_cooking_experience IS 'Whether child has previous cooking class experience';
COMMENT ON COLUMN students.cooking_experience_details IS 'Details about previous cooking experience';
COMMENT ON COLUMN students.allergies IS 'All allergies or food sensitivities';
COMMENT ON COLUMN students.dietary_restrictions IS 'Dietary restrictions (vegetarian, vegan, no pork, gluten-free, etc.)';
COMMENT ON COLUMN students.medical_conditions IS 'Medical conditions staff should be aware of';
COMMENT ON COLUMN students.emergency_medications IS 'Emergency medications needed (EpiPen, inhaler, etc.)';
COMMENT ON COLUMN students.additional_notes IS 'Any other important information about the child';
COMMENT ON COLUMN students.parent_guardian_names IS 'Parent/Guardian name(s)';
COMMENT ON COLUMN students.parent_phone IS 'Parent/Guardian phone number';
COMMENT ON COLUMN students.parent_email IS 'Parent/Guardian email address';
COMMENT ON COLUMN students.preferred_communication_method IS 'Preferred method: Text or Email';
COMMENT ON COLUMN students.emergency_contact_name IS 'Emergency contact person name';
COMMENT ON COLUMN students.emergency_contact_phone IS 'Emergency contact phone number';
COMMENT ON COLUMN students.emergency_contact_relationship IS 'Emergency contact relationship to child';
COMMENT ON COLUMN students.authorized_pickup_persons IS 'List of people authorized to pick up the child';
COMMENT ON COLUMN students.custody_restrictions IS 'Any custody restrictions or safety notes';
COMMENT ON COLUMN students.media_permission IS 'Permission for photos/videos in portfolios, social media, and promotional materials';

-- Create indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_students_child_full_name ON students(child_full_name);
CREATE INDEX IF NOT EXISTS idx_students_parent_email ON students(parent_email);
CREATE INDEX IF NOT EXISTS idx_students_parent_phone ON students(parent_phone);
CREATE INDEX IF NOT EXISTS idx_students_child_age ON students(child_age);

-- Drop the old unique constraint if it exists
DROP INDEX IF EXISTS uq_students_parent_child_email;

-- Create new unique constraint based on parent_email and child_full_name
CREATE UNIQUE INDEX IF NOT EXISTS uq_students_parent_email_child_full_name
  ON students (LOWER(parent_email), LOWER(child_full_name))
  WHERE parent_email IS NOT NULL AND child_full_name IS NOT NULL;
