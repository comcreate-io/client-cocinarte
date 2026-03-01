// Guest booking types for gift bookings where a registered user
// purchases a class for a friend's child

export interface GuestBooking {
  id: string
  booking_id: string
  purchaser_user_id: string
  purchaser_name: string
  purchaser_email: string
  guest_parent_name: string
  guest_parent_email: string
  guest_child_name: string
  form_token: string
  form_completed_at: string | null
  guest_child_id: string | null
  created_at: string
  updated_at: string
}

export interface GuestChild {
  id: string
  // Child fields
  child_full_name: string
  child_age: number
  child_preferred_name?: string
  has_cooking_experience: boolean
  cooking_experience_details?: string
  allergies?: string
  dietary_restrictions?: string
  medical_conditions?: string
  emergency_medications?: string
  additional_notes?: string
  authorized_pickup_persons?: string
  custody_restrictions?: string
  media_permission: boolean
  // Parent fields
  guest_parent_email: string
  guest_parent_name: string
  guest_parent_phone: string
  emergency_contact_name: string
  emergency_contact_phone: string
  emergency_contact_relationship: string
  // Consent fields
  liability_consent: boolean
  social_media_consent: boolean
  parent_name_signed: string
  child_name_signed: string
  signature_url: string | null
  signature_public_id: string | null
  signed_at: string
  // Metadata
  created_at: string
  updated_at: string
}

export interface GuestFormSubmission {
  // Child info
  child_full_name: string
  child_age: number
  child_preferred_name?: string
  has_cooking_experience: boolean
  cooking_experience_details?: string
  // Health & Safety
  allergies?: string
  dietary_restrictions?: string
  medical_conditions?: string
  emergency_medications?: string
  additional_notes?: string
  // Pick-up & Emergency
  authorized_pickup_persons?: string
  custody_restrictions?: string
  guest_parent_name: string
  guest_parent_phone: string
  emergency_contact_name: string
  emergency_contact_phone: string
  emergency_contact_relationship: string
  // Consent
  liability_consent: boolean
  social_media_consent: boolean
  parent_name_signed: string
  child_name_signed: string
  signature_data_url: string
  media_permission: boolean
}
