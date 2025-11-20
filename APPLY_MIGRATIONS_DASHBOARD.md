# Apply Migrations via Supabase Dashboard

The CLI and direct database connections are blocked by Supabase security settings. Please use the dashboard method:

## Step-by-Step Instructions

### 1. Open Supabase SQL Editor

Go to: https://supabase.com/dashboard/project/mwipqlvteowoyipbozyu/sql/new

### 2. Apply First Migration

**Copy this file content:**
`supabase/migrations/20251120145601_add_comprehensive_student_parent_info.sql`

**Steps:**
1. Open the file in your editor
2. Copy ALL the SQL content (Cmd/Ctrl + A, then Cmd/Ctrl + C)
3. Paste into the Supabase SQL Editor
4. Click "Run" button (bottom right)
5. Wait for "Success" message

### 3. Apply Second Migration

**Copy this file content:**
`supabase/migrations/20251120161733_create_parents_children_tables.sql`

**Steps:**
1. Open the file in your editor
2. Copy ALL the SQL content
3. Paste into the Supabase SQL Editor (clear previous query first)
4. Click "Run" button
5. Wait for "Success" message

### 4. Verify Success

**Check Tables Created:**
1. Go to: https://supabase.com/dashboard/project/mwipqlvteowoyipbozyu/editor
2. You should see new tables:
   - `parents`
   - `children`

**Check Data Migrated:**
1. Click on `parents` table
2. You should see parent records (if you had any students)
3. Click on `children` table
4. You should see child records

### 5. Test the Application

```bash
npm run dev
```

Then visit:
- **Signup**: http://localhost:3000/signup
- **Account**: http://localhost:3000/account (after logging in)

---

## Why CLI Didn't Work

Supabase restricts direct database connections for security. The recommended approach is:
1. Use Supabase Dashboard SQL Editor (what we're doing)
2. Use Supabase CLI with proper authentication (requires interactive login)
3. Use Supabase Management API (requires API keys with specific permissions)

The dashboard method is the most straightforward and reliable!

---

## Expected Results After Migration

### New Database Tables

**parents table:**
- Stores one parent record per user account
- Contains parent contact info, emergency contacts
- Linked to auth.users via user_id

**children table:**
- Stores multiple children per parent
- Contains all child info (health, safety, pickup, media permissions)
- Linked to parents via parent_id

### Existing Data

If you had existing records in the `students` table:
- Parent information extracted and deduplicated
- Child records created and linked to parents
- All data preserved

---

## Still Having Issues?

If migrations fail in the dashboard:
1. Check error message in Supabase
2. Common issues:
   - Tables already exist → Safe to ignore if from previous attempts
   - Permission errors → Make sure you're logged in as project owner
   - Syntax errors → Make sure you copied the ENTIRE file

---

## Next Steps After Successful Migration

1. ✅ Test signup with multiple children
2. ✅ Test account page - view/add/edit/delete children
3. ✅ Update booking flow to select which child
4. ✅ Enjoy your new multi-child account system!
