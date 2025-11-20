-- Migration to support multiple children per parent account
-- Creates parents and children tables with proper relationships

-- Create parents table
CREATE TABLE IF NOT EXISTS parents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_guardian_names TEXT NOT NULL,
  parent_phone VARCHAR(50) NOT NULL,
  parent_email VARCHAR(255) NOT NULL UNIQUE,
  preferred_communication_method VARCHAR(50) DEFAULT 'email',
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  emergency_contact_relationship VARCHAR(100),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create children table
CREATE TABLE IF NOT EXISTS children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE NOT NULL,

  -- Child Information
  child_full_name VARCHAR(255) NOT NULL,
  child_age INTEGER NOT NULL,
  child_preferred_name VARCHAR(255),
  has_cooking_experience BOOLEAN DEFAULT false,
  cooking_experience_details TEXT,

  -- Health & Safety
  allergies TEXT,
  dietary_restrictions TEXT,
  medical_conditions TEXT,
  emergency_medications TEXT,
  additional_notes TEXT,

  -- Pick-Up Information
  authorized_pickup_persons TEXT,
  custody_restrictions TEXT,

  -- Media Permission
  media_permission BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for parents
CREATE INDEX IF NOT EXISTS idx_parents_user_id ON parents(user_id);
CREATE INDEX IF NOT EXISTS idx_parents_email ON parents(parent_email);
CREATE INDEX IF NOT EXISTS idx_parents_phone ON parents(parent_phone);

-- Indexes for children
CREATE INDEX IF NOT EXISTS idx_children_parent_id ON children(parent_id);
CREATE INDEX IF NOT EXISTS idx_children_full_name ON children(child_full_name);
CREATE INDEX IF NOT EXISTS idx_children_age ON children(child_age);

-- Unique constraint: one parent per email
CREATE UNIQUE INDEX IF NOT EXISTS uq_parents_email ON parents(LOWER(parent_email));

-- Updated at triggers
CREATE TRIGGER update_parents_updated_at
    BEFORE UPDATE ON parents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_children_updated_at
    BEFORE UPDATE ON children
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE parents IS 'Parent/guardian accounts - one parent can have multiple children';
COMMENT ON TABLE children IS 'Children registered for cooking classes - linked to parent accounts';

COMMENT ON COLUMN parents.user_id IS 'Reference to auth.users for authentication';
COMMENT ON COLUMN parents.preferred_communication_method IS 'Preferred method: text or email';
COMMENT ON COLUMN children.parent_id IS 'Reference to parent account';
COMMENT ON COLUMN children.media_permission IS 'Permission for photos/videos in portfolios, social media, and promotional materials';

-- Migrate existing data from students table to new structure
-- This will create parent records and child records from existing students
DO $$
DECLARE
  has_parent_guardian_names BOOLEAN;
  has_parent_phone BOOLEAN;
  has_parent_email BOOLEAN;
  has_preferred_communication BOOLEAN;
  has_emergency_contact_name BOOLEAN;
  has_emergency_contact_phone BOOLEAN;
  has_emergency_contact_relationship BOOLEAN;
  has_address BOOLEAN;
  has_child_full_name BOOLEAN;
  has_child_age BOOLEAN;
  has_child_preferred_name BOOLEAN;
  has_cooking_experience BOOLEAN;
  has_cooking_experience_details BOOLEAN;
  has_allergies BOOLEAN;
  has_dietary_restrictions BOOLEAN;
  has_medical_conditions BOOLEAN;
  has_emergency_medications BOOLEAN;
  has_additional_notes BOOLEAN;
  has_authorized_pickup BOOLEAN;
  has_custody_restrictions BOOLEAN;
  has_media_permission BOOLEAN;

  -- Old column names
  has_parent_name BOOLEAN;
  has_phone BOOLEAN;
  has_email BOOLEAN;
  has_child_name BOOLEAN;
BEGIN
  -- Only run if students table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'students') THEN

    -- Check which columns exist in the students table
    SELECT
      bool_or(column_name = 'parent_guardian_names'),
      bool_or(column_name = 'parent_phone'),
      bool_or(column_name = 'parent_email'),
      bool_or(column_name = 'preferred_communication_method'),
      bool_or(column_name = 'emergency_contact_name'),
      bool_or(column_name = 'emergency_contact_phone'),
      bool_or(column_name = 'emergency_contact_relationship'),
      bool_or(column_name = 'address'),
      bool_or(column_name = 'child_full_name'),
      bool_or(column_name = 'child_age'),
      bool_or(column_name = 'child_preferred_name'),
      bool_or(column_name = 'has_cooking_experience'),
      bool_or(column_name = 'cooking_experience_details'),
      bool_or(column_name = 'allergies'),
      bool_or(column_name = 'dietary_restrictions'),
      bool_or(column_name = 'medical_conditions'),
      bool_or(column_name = 'emergency_medications'),
      bool_or(column_name = 'additional_notes'),
      bool_or(column_name = 'authorized_pickup_persons'),
      bool_or(column_name = 'custody_restrictions'),
      bool_or(column_name = 'media_permission'),
      bool_or(column_name = 'parent_name'),
      bool_or(column_name = 'phone'),
      bool_or(column_name = 'email'),
      bool_or(column_name = 'child_name')
    INTO
      has_parent_guardian_names,
      has_parent_phone,
      has_parent_email,
      has_preferred_communication,
      has_emergency_contact_name,
      has_emergency_contact_phone,
      has_emergency_contact_relationship,
      has_address,
      has_child_full_name,
      has_child_age,
      has_child_preferred_name,
      has_cooking_experience,
      has_cooking_experience_details,
      has_allergies,
      has_dietary_restrictions,
      has_medical_conditions,
      has_emergency_medications,
      has_additional_notes,
      has_authorized_pickup,
      has_custody_restrictions,
      has_media_permission,
      has_parent_name,
      has_phone,
      has_email,
      has_child_name
    FROM information_schema.columns
    WHERE table_name = 'students';

    -- Build and execute dynamic SQL for migration
    -- Use parent_email if available, otherwise email
    DECLARE
      email_column TEXT := CASE WHEN has_parent_email THEN 'parent_email' WHEN has_email THEN 'email' ELSE NULL END;
      parent_name_expr TEXT := CASE
        WHEN has_parent_guardian_names THEN 'parent_guardian_names'
        WHEN has_parent_name THEN 'parent_name'
        ELSE '''Parent'''
      END;
      parent_phone_expr TEXT := CASE
        WHEN has_parent_phone THEN 'parent_phone'
        WHEN has_phone THEN 'phone'
        ELSE ''''''
      END;
      child_name_expr TEXT := CASE
        WHEN has_child_full_name THEN 'child_full_name'
        WHEN has_child_name THEN 'child_name'
        ELSE '''Child'''
      END;
    BEGIN
      IF email_column IS NOT NULL THEN
        -- Create parents from unique emails
        EXECUTE format('
          INSERT INTO parents (
            parent_guardian_names,
            parent_phone,
            parent_email,
            preferred_communication_method,
            emergency_contact_name,
            emergency_contact_phone,
            emergency_contact_relationship,
            address,
            created_at,
            updated_at
          )
          SELECT DISTINCT ON (LOWER(%I))
            %s,
            %s,
            %I,
            ' || (CASE WHEN has_preferred_communication THEN 'COALESCE(preferred_communication_method, ''email'')' ELSE '''email''' END) || ',
            ' || (CASE WHEN has_emergency_contact_name THEN 'emergency_contact_name' ELSE 'NULL' END) || ',
            ' || (CASE WHEN has_emergency_contact_phone THEN 'emergency_contact_phone' ELSE 'NULL' END) || ',
            ' || (CASE WHEN has_emergency_contact_relationship THEN 'emergency_contact_relationship' ELSE 'NULL' END) || ',
            ' || (CASE WHEN has_address THEN 'address' ELSE 'NULL' END) || ',
            created_at,
            updated_at
          FROM students
          WHERE %I IS NOT NULL
          ORDER BY LOWER(%I), created_at
          ON CONFLICT (parent_email) DO NOTHING
        ', email_column, parent_name_expr, parent_phone_expr, email_column, email_column, email_column);

        -- Create children linked to parents
        EXECUTE format('
          INSERT INTO children (
            parent_id,
            child_full_name,
            child_age,
            child_preferred_name,
            has_cooking_experience,
            cooking_experience_details,
            allergies,
            dietary_restrictions,
            medical_conditions,
            emergency_medications,
            additional_notes,
            authorized_pickup_persons,
            custody_restrictions,
            media_permission,
            created_at,
            updated_at
          )
          SELECT
            p.id,
            COALESCE(%s, ''Child''),
            ' || (CASE WHEN has_child_age THEN 'COALESCE(s.child_age, 5)' ELSE '5' END) || ',
            ' || (CASE WHEN has_child_preferred_name THEN 's.child_preferred_name' ELSE 'NULL' END) || ',
            ' || (CASE WHEN has_cooking_experience THEN 'COALESCE(s.has_cooking_experience, false)' ELSE 'false' END) || ',
            ' || (CASE WHEN has_cooking_experience_details THEN 's.cooking_experience_details' ELSE 'NULL' END) || ',
            ' || (CASE WHEN has_allergies THEN 's.allergies' ELSE 'NULL' END) || ',
            ' || (CASE WHEN has_dietary_restrictions THEN 's.dietary_restrictions' ELSE 'NULL' END) || ',
            ' || (CASE WHEN has_medical_conditions THEN 's.medical_conditions' ELSE 'NULL' END) || ',
            ' || (CASE WHEN has_emergency_medications THEN 's.emergency_medications' ELSE 'NULL' END) || ',
            ' || (CASE WHEN has_additional_notes THEN 's.additional_notes' ELSE 'NULL' END) || ',
            ' || (CASE WHEN has_authorized_pickup THEN 's.authorized_pickup_persons' ELSE 'NULL' END) || ',
            ' || (CASE WHEN has_custody_restrictions THEN 's.custody_restrictions' ELSE 'NULL' END) || ',
            ' || (CASE WHEN has_media_permission THEN 'COALESCE(s.media_permission, false)' ELSE 'false' END) || ',
            s.created_at,
            s.updated_at
          FROM students s
          INNER JOIN parents p ON p.parent_email = s.%I
          WHERE s.%I IS NOT NULL
        ', child_name_expr, email_column, email_column);

        RAISE NOTICE 'Migration completed successfully';
      ELSE
        RAISE NOTICE 'No email column found in students table, skipping migration';
      END IF;
    END;
  END IF;
END $$;
