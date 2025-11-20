# Multi-Child Account Implementation Guide

## Overview
This guide explains how to apply the database migrations and use the new multi-child account feature.

---

## Step 1: Apply Database Migrations

### Option A: Via Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/mwipqlvteowoyipbozyu/editor/sql

2. **Apply the comprehensive student/parent info migration**
   - Open file: `supabase/migrations/20251120145601_add_comprehensive_student_parent_info.sql`
   - Copy the entire SQL content
   - Paste into SQL Editor
   - Click "Run"

3. **Apply the parent/children tables migration**
   - Open file: `supabase/migrations/20251120161733_create_parents_children_tables.sql`
   - Copy the entire SQL content
   - Paste into SQL Editor
   - Click "Run"

   **Important**: This migration will:
   - Create new `parents` and `children` tables
   - Migrate existing data from `students` table
   - Set up proper relationships and indexes

### Option B: Via Supabase CLI (If connection works)

```bash
# Make sure you're in the project directory
cd /Users/diego/Desktop/cocinarte

# Apply all pending migrations
PGPASSWORD="xwW1e714uxcNuZWk" supabase db push
```

---

## Step 2: Verify Migration Success

After running the migrations, verify in Supabase Dashboard:

1. **Check Tables Created**:
   - Go to Database → Tables
   - You should see: `parents` and `children` tables

2. **Check Data Migration**:
   - Open `parents` table - should contain parent records from old `students` table
   - Open `children` table - should contain child records from old `students` table

3. **Check Relationships**:
   - Children table should have `parent_id` foreign key to parents table

---

## Step 3: Using the Children Management Feature

### For Users (Account Settings)

Users can now manage multiple children from their account:

1. **View All Children**
   - Shows all children with their health/safety info
   - Color-coded alerts for important health information

2. **Add New Child**
   - Click "Add Child" button
   - Fill out comprehensive form (name, age, health info, etc.)
   - Save

3. **Edit Child**
   - Click edit icon on any child card
   - Update information
   - Save changes

4. **Delete Child**
   - Click delete icon
   - Confirm deletion

### For Developers (Integration)

#### Using the ParentsClientService

```typescript
import { ParentsClientService } from '@/lib/supabase/parents-client'

const parentsService = new ParentsClientService()

// Get parent with all children
const parentWithChildren = await parentsService.getParentWithChildrenByUserId(userId)

// Add a new child
await parentsService.addChild(parentId, {
  child_full_name: 'Jane Doe',
  child_age: 8,
  // ... other child data
})

// Update child
await parentsService.updateChild(childId, {
  child_age: 9, // Birthday!
})

// Delete child
await parentsService.deleteChild(childId)
```

#### Integrating Children Management in Account View

```tsx
import ChildrenManagement from '@/components/account/children-management'

// In your account component
<ChildrenManagement
  parentId={parent.id}
  onUpdate={() => {
    // Refresh data after changes
  }}
/>
```

---

## Step 4: Testing the Feature

### Test Signup Flow

1. **Navigate to signup**: http://localhost:3000/signup
   - Or click "Sign In" → "Sign up here"

2. **Complete the form**:
   - Step 1: Enter email/password
   - Step 2: Enter parent information
   - Step 3: Add at least one child (can add multiple)
   - Step 4: Review and submit

3. **Verify**:
   - Check Supabase `parents` table for new parent record
   - Check `children` table for child records
   - All children should have the same `parent_id`

### Test Children Management

1. **Login to existing account**
2. **Navigate to account settings**
3. **Test operations**:
   - ✅ View all children
   - ✅ Add a new child
   - ✅ Edit existing child
   - ✅ Delete a child

---

## Database Schema

### Parents Table

```sql
parents (
  id UUID PRIMARY KEY,
  user_id UUID → auth.users(id),
  parent_guardian_names TEXT NOT NULL,
  parent_phone VARCHAR(50) NOT NULL,
  parent_email VARCHAR(255) UNIQUE NOT NULL,
  preferred_communication_method VARCHAR(50),
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  emergency_contact_relationship VARCHAR(100),
  address TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Children Table

```sql
children (
  id UUID PRIMARY KEY,
  parent_id UUID → parents(id) NOT NULL,

  -- Child Info
  child_full_name VARCHAR(255) NOT NULL,
  child_age INTEGER NOT NULL,
  child_preferred_name VARCHAR(255),
  has_cooking_experience BOOLEAN,
  cooking_experience_details TEXT,

  -- Health & Safety
  allergies TEXT,
  dietary_restrictions TEXT,
  medical_conditions TEXT,
  emergency_medications TEXT,
  additional_notes TEXT,

  -- Pick-up & Media
  authorized_pickup_persons TEXT,
  custody_restrictions TEXT,
  media_permission BOOLEAN,

  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

---

## New Files Created

### Services
- `lib/supabase/parents-client.ts` - Service layer for parent/child operations

### Components
- `components/auth/signup-questionnaire-multi-child.tsx` - Multi-child signup form
- `components/account/children-management.tsx` - Children management UI

### Types
- Updated `types/student.ts` with Parent, Child, ParentWithChildren types

### Migrations
- `supabase/migrations/20251120161733_create_parents_children_tables.sql`

---

## Key Features

### During Signup ✅
- Add multiple children in one signup process
- Each child has complete health/safety information
- Collapsible sections for easier form completion
- Edit/delete children before submission

### Account Management ✅
- View all children in beautiful card layout
- Color-coded health alerts
- Quick access to important information
- Easy add/edit/delete operations

### Data Integrity ✅
- Proper foreign key relationships
- Cascading deletes (if parent deleted, children deleted)
- Unique constraints on parent email
- Indexed for fast queries

---

## Backward Compatibility

The old `students` table remains intact for backward compatibility. The migration automatically:
- Extracts parent data from students table
- Creates parent records
- Links children to parents
- Handles duplicate emails (keeps most recent)

---

## Next Steps

1. **Apply the migrations** (Step 1 above)
2. **Test the signup flow**
3. **Integrate ChildrenManagement component** into your account page
4. **Update booking flow** to allow parent to select which child to book for

---

## Support

If you encounter issues:
1. Check Supabase logs for errors
2. Verify migrations were applied successfully
3. Check browser console for client-side errors
4. Ensure environment variables are set correctly

---

## Future Enhancements

Potential additions:
- Allow selecting specific child when booking a class
- Child-specific booking history
- Age-appropriate class recommendations
- Birthday reminders
- Progress tracking per child
