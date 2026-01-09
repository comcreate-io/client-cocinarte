// Consent form types for social media/video approval and liability waiver

export interface ConsentForm {
  id: string
  child_id: string
  parent_id: string

  // Consent flags
  social_media_consent: boolean
  liability_consent: boolean

  // Signature data
  parent_name_signed: string
  child_name_signed: string
  signature_url: string | null
  signature_public_id: string | null

  // Metadata
  form_version: string
  ip_address: string | null
  user_agent: string | null

  // Dates
  signed_at: string
  revoked_at: string | null
  created_at: string
  updated_at: string
}

export interface ConsentFormWithChild extends ConsentForm {
  child: {
    id: string
    child_full_name: string
    child_preferred_name?: string
  }
}

export interface ChildWithConsent {
  id: string
  child_full_name: string
  child_preferred_name?: string
  child_age: number
  consent_form?: ConsentForm | null
}

// Form data for creating a new consent
export interface ConsentFormData {
  child_id: string
  parent_id: string
  social_media_consent: boolean
  liability_consent: boolean
  parent_name_signed: string
  child_name_signed: string
  signature_data_url: string // Base64 signature image to upload
}

// API response types
export interface ConsentSignResponse {
  success: boolean
  consent_form?: ConsentForm
  error?: string
}

export interface ConsentStatusResponse {
  success: boolean
  has_active_consent: boolean
  social_media_consent: boolean
  liability_consent: boolean
  consent_form?: ConsentForm
  error?: string
}

// Consent form version - increment when form text changes
export const CONSENT_FORM_VERSION = '1.0'

// Consent form text constants
export const SOCIAL_MEDIA_CONSENT_TEXT = {
  title: 'Social Media & Video Participation Consent',
  intro: 'I give permission for my child to participate in photos and/or short video recordings during Cocinarte cooking classes and events.',
  understanding: 'I understand that Cocinarte operates under the Casita Azul Education Collective, and that these photos and videos may be used for promotional and educational purposes, including but not limited to:',
  uses: [
    'Social media platforms (Instagram, Facebook, TikTok)',
    'Websites operated by Cocinarte and Casita Azul Education Collective',
    'Digital or printed marketing materials',
  ],
  privacy: 'I understand that my child\'s last name will never be shared publicly.',
  revocation: 'I acknowledge that participation is voluntary and that I may revoke this consent at any time by submitting a written request.',
}

export const LIABILITY_CONSENT_TEXT = {
  title: 'Cooking Program Liability Acknowledgment',
  intro: 'I understand that Cocinarte provides hands-on cooking experiences for children using age-appropriate tools, ingredients, and instruction.',
  risks: 'I acknowledge that participation in cooking activities involves some inherent risks, including but not limited to minor cuts, spills, or exposure to food ingredients. Cocinarte staff take reasonable precautions to ensure a safe and supervised environment at all times.',
  release: 'By enrolling my child, I agree to release and hold harmless Cocinarte and Casita Azul Education Collective, including its staff and instructors, from liability for minor injuries that may occur as a result of normal participation in program activities, except in cases of gross negligence.',
  disclosure: 'I confirm that I have disclosed any food allergies, medical conditions, or special needs prior to participation.',
}
