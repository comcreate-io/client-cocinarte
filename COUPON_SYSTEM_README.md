# Discount Coupon System - Implementation Guide

## Overview

A complete discount coupon system has been implemented for Cocinarte, allowing administrators to create, manage, and distribute discount coupons via email. Users can apply these coupons during the booking process to receive discounts on cooking class bookings.

## Features

### ✅ Admin Dashboard Features
- **Create Coupons**: Generate random 6-character alphanumeric coupon codes
- **Set Discount**: Define discount percentage (1-100%)
- **Send via Email**: Send coupons directly to recipients with beautiful email templates
- **Track Usage**: Monitor which coupons have been used and by whom
- **Statistics Dashboard**: View total, used, available, and sent coupons
- **Copy Codes**: Quick copy-to-clipboard functionality
- **Delete Coupons**: Remove unused coupons

### ✅ Customer Booking Features
- **Apply Coupon**: Enter coupon code during payment
- **Real-time Validation**: Instant validation with error handling
- **Discount Display**: Clear breakdown showing original price, discount, and final price
- **Single Use**: Each coupon can only be used once
- **Automatic Marking**: Coupons automatically marked as used after successful payment

## Database Setup

### Step 1: Create the Coupons Table in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `scripts/create-coupons-table.sql`
4. Execute the SQL

The table includes the following fields:
- `id`: Unique identifier (UUID)
- `code`: 6-character alphanumeric coupon code (unique)
- `discount_percentage`: Discount percentage (1-100)
- `is_used`: Boolean flag indicating if coupon has been used
- `used_by_user_id`: UUID of the user who used the coupon
- `used_at`: Timestamp when coupon was used
- `recipient_email`: Email address where coupon was sent
- `sent_at`: Timestamp when coupon was sent
- `created_by`: Email of admin who created the coupon
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## File Structure

### New Files Created

```
/lib/types/coupons.ts                          # TypeScript types for coupons
/lib/supabase/coupons-client.ts                # Client-side coupon service
/app/api/send-coupon/route.ts                  # API endpoint for sending coupon emails
/app/dashboard/coupons/page.tsx                # Admin coupon management page
/components/dashboard/coupons-client.tsx       # Admin UI component
/scripts/setup-coupons-table.ts                # TypeScript setup script
/scripts/create-coupons-table.sql              # SQL table creation script
```

### Modified Files

```
/components/cocinarte/cocinarte-booking-popup.tsx  # Added coupon input and discount logic
```

## Usage Guide

### For Administrators

#### Accessing the Coupon Dashboard

1. Log in to the admin dashboard
2. Navigate to `/dashboard/coupons`
3. You'll see:
   - Statistics cards (Total, Used, Available, Sent via Email)
   - List of all coupons with their status
   - Create and send email functionality

#### Creating a New Coupon

1. Click **"Create New Coupon"** button
2. Enter discount percentage (1-100%)
3. Click **"Create Coupon"**
4. A random 6-character code will be generated automatically
5. The coupon appears in the list as "Available"

#### Sending a Coupon via Email

1. Find the coupon in the list
2. Click **"Send"** button
3. Enter recipient's name (optional)
4. Enter recipient's email address
5. Click **"Send Email"**
6. The recipient will receive a beautifully formatted email with:
   - Discount percentage
   - Coupon code
   - Instructions on how to use it
   - Call-to-action button to browse classes

#### Managing Coupons

- **Copy Code**: Click the copy icon next to any coupon code
- **Delete**: Click trash icon to delete unused coupons
- **Filter by Status**: View used vs. available coupons
- **Track Sending**: See which email address received each coupon

### For Customers

#### Applying a Coupon During Booking

1. Select a cooking class and proceed to payment
2. In the payment section, you'll see "Have a Discount Coupon?"
3. Enter your 6-character coupon code (case-insensitive)
4. Click **"Apply"**
5. If valid:
   - Coupon badge appears with discount percentage
   - Price breakdown shows original price, discount amount, and final price
   - Payment form updates with discounted amount
6. Complete payment
7. Coupon is automatically marked as used

#### Coupon Validation

The system validates:
- ✅ Coupon exists in database
- ✅ Coupon hasn't been used before
- ❌ Shows error if coupon is invalid or already used

## Email Template

The coupon email includes:
- Eye-catching header with gift emoji
- Large, bold discount percentage
- Monospaced coupon code for easy reading
- Step-by-step usage instructions
- Call-to-action button
- Important notes about single-use limitation
- Professional footer with company branding

## Technical Implementation

### Coupon Code Generation

```typescript
generateCouponCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
```

### Discount Calculation

```typescript
calculateFinalPrice(): number {
  if (!selectedClassData || !appliedCoupon) return selectedClassData.price
  const discount = (selectedClassData.price * appliedCoupon.discount) / 100
  return selectedClassData.price - discount
}
```

### Payment Integration

- Stripe payment intent is created with the **discounted amount**
- Booking record stores the **final price after discount**
- Booking notes include coupon details for reference
- Coupon is marked as used only after successful payment

## API Endpoints

### POST `/api/send-coupon`

Send a coupon via email to a recipient.

**Request Body:**
```json
{
  "couponCode": "ABC123",
  "discountPercentage": 20,
  "recipientEmail": "customer@example.com",
  "recipientName": "John Doe" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Coupon email sent successfully"
}
```

## Security Features

1. **Row Level Security (RLS)**: Enabled on coupons table
2. **Authenticated Access**: Only logged-in users can read coupons
3. **Service Role for Admin**: Admin operations require service role
4. **Single Use Enforcement**: Database constraint prevents reuse
5. **Validation Before Payment**: Coupon validated before payment intent creation

## Testing Checklist

- [ ] Create a new coupon from admin dashboard
- [ ] Send coupon email and verify receipt
- [ ] Apply valid coupon during booking
- [ ] Verify discount calculation is correct
- [ ] Complete payment and verify coupon marked as used
- [ ] Try to reuse same coupon (should fail)
- [ ] Try invalid coupon code (should show error)
- [ ] Check booking notes include coupon details
- [ ] Verify admin dashboard statistics update correctly

## Future Enhancements (Optional)

Consider adding these features in the future:
- [ ] Expiration dates for coupons
- [ ] Usage limits (use coupon N times)
- [ ] Coupon categories (class-specific, user-specific)
- [ ] Bulk coupon generation
- [ ] Coupon analytics and reporting
- [ ] Minimum purchase amount requirements
- [ ] Combination with other offers

## Troubleshooting

### Coupon validation failing
- Verify coupons table was created correctly in Supabase
- Check RLS policies allow authenticated users to read
- Ensure user is logged in before applying coupon

### Email not sending
- Verify SMTP credentials in `.env.local`
- Check `/api/send-coupon` endpoint logs
- Confirm nodemailer is properly configured

### Discount not applying to payment
- Check `calculateFinalPrice()` function is called correctly
- Verify payment intent uses discounted amount
- Ensure `appliedCoupon` state is set properly

## Support

If you encounter any issues:
1. Check browser console for errors
2. Review server logs for API errors
3. Verify database table and policies are set up correctly
4. Ensure all environment variables are configured

---

**Implementation Date**: November 2025
**Version**: 1.0.0
**Status**: ✅ Complete and Ready for Production
