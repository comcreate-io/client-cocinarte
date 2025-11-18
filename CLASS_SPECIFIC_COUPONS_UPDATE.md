# Class-Specific Coupons Update

## Overview
Updated the coupon system to support class-specific coupons. Admins can now create coupons that are valid only for specific classes, or create universal coupons valid for all classes.

## Database Changes

### Updated Table Schema
Added `class_id` column to the `coupons` table:

```sql
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS class_id UUID;
CREATE INDEX IF NOT EXISTS idx_coupons_class_id ON coupons(class_id);
```

**Migration Script**: Run `scripts/add-class-id-to-coupons.sql` if you already created the coupons table.

**For New Installations**: Use `scripts/create-coupons-table.sql` which includes the `class_id` field.

## Features Added

### 1. Admin Dashboard - Class Selection
- When creating a coupon, admins can now select a specific class or leave it blank for a universal coupon
- Dropdown shows all upcoming classes with title and date
- Universal coupons work for any class
- Class-specific coupons only work for the selected class

### 2. Coupon Table Display
- Added "Valid For" column showing which class the coupon is for
- Shows class name and date for class-specific coupons
- Shows "All Classes" badge for universal coupons

### 3. Email Template with Class Details
- When sending a class-specific coupon, the email includes:
  - Class title
  - Class date (formatted)
  - Class time
  - Original price
  - Discounted price (calculated)
- Universal coupons show generic message: "This coupon can be used once on any Cocinarte class"

### 4. Validation During Booking
- System validates that the coupon is valid for the selected class
- If coupon is class-specific and doesn't match, shows error: "This coupon is not valid for this class"
- Universal coupons work for any class selection

## Files Modified

### Database
- `scripts/create-coupons-table.sql` - Added class_id column
- `scripts/add-class-id-to-coupons.sql` - Migration script for existing tables

### Types
- `lib/types/coupons.ts`:
  - Added `class_id?` to `Coupon` interface
  - Added `class_id?` to `CreateCouponData` interface
  - Added `class_details` to `SendCouponEmailData` interface
  - Added `CouponWithClass` interface for coupons with class data

### Services
- `lib/supabase/coupons-client.ts`:
  - Updated `createCoupon()` to accept `class_id`
  - Updated `validateCoupon()` to accept `classId` parameter and validate match
  - Added `getCouponWithClassDetails()` method to fetch coupon with class info

### Admin UI
- `app/dashboard/coupons/page.tsx`:
  - Fetches upcoming classes from database
  - Passes classes to CouponsClient component

- `components/dashboard/coupons-client.tsx`:
  - Added class selection dropdown in Create Coupon dialog
  - Added "Valid For" column in coupons table
  - Shows class details for class-specific coupons
  - Passes class details when sending emails

### Email API
- `app/api/send-coupon/route.ts`:
  - Accepts `classDetails` parameter
  - Includes class information in email template
  - Shows discounted price calculation for class-specific coupons

### Booking Flow
- `components/cocinarte/cocinarte-booking-popup.tsx`:
  - Updated `handleApplyCoupon()` to pass `selectedClassId` to validation
  - Validates coupon is for the correct class before applying

## Usage Examples

### Creating a Universal Coupon
1. Go to Dashboard → Coupons
2. Click "Create New Coupon"
3. Leave "Valid for Class" as "All classes (universal coupon)"
4. Set discount percentage
5. Click "Create Coupon"

### Creating a Class-Specific Coupon
1. Go to Dashboard → Coupons
2. Click "Create New Coupon"
3. Select specific class from dropdown
4. Set discount percentage
5. Click "Create Coupon"

### Sending Coupon via Email
1. Find coupon in list
2. Click "Send" button
3. Enter recipient information
4. If class-specific, email will include all class details
5. Click "Send Email"

### Customer Using Coupon
1. Customer selects a class
2. Proceeds to payment
3. Enters coupon code
4. System validates:
   - ✅ Coupon exists
   - ✅ Coupon not already used
   - ✅ Coupon is valid for selected class (if class-specific)
5. Discount applied if validation passes

## Error Messages

### Customer-Facing
- "Coupon not found" - Invalid code
- "Coupon has already been used" - Single-use enforcement
- "This coupon is not valid for this class" - Class mismatch
- "Please select a class first" - No class selected yet

## Testing Checklist

- [ ] Run database migration to add class_id column
- [ ] Create a universal coupon (no class selected)
- [ ] Create a class-specific coupon
- [ ] View coupons table - verify "Valid For" column shows correctly
- [ ] Send class-specific coupon via email - verify class details in email
- [ ] Try using universal coupon on any class - should work
- [ ] Try using class-specific coupon on correct class - should work
- [ ] Try using class-specific coupon on wrong class - should fail with error
- [ ] Verify coupon marked as used after successful booking

## Database Migration Steps

### If you haven't created the coupons table yet:
```bash
# Run in Supabase SQL Editor
cat scripts/create-coupons-table.sql
# Copy and execute the SQL
```

### If you already have the coupons table:
```bash
# Run in Supabase SQL Editor
cat scripts/add-class-id-to-coupons.sql
# Copy and execute the SQL
```

## Benefits

1. **Targeted Marketing**: Create coupons for specific classes that need more enrollment
2. **Flexibility**: Still supports universal coupons for general promotions
3. **Better Control**: Prevent misuse of class-specific promotional codes
4. **Customer Clarity**: Email clearly shows which class the coupon is for
5. **Validation**: System prevents applying wrong coupons to wrong classes

---

**Implementation Date**: November 2025
**Version**: 2.0.0
**Status**: ✅ Complete and Ready for Production
