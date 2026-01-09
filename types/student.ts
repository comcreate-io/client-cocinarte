// Comprehensive parent and children information types

export interface ChildInformation {
  child_full_name: string
  child_age: number
  child_preferred_name?: string
  has_cooking_experience: boolean
  cooking_experience_details?: string
}

export interface HealthAndSafety {
  allergies?: string
  dietary_restrictions?: string
  medical_conditions?: string
  emergency_medications?: string
  additional_notes?: string
}

export interface ParentInformation {
  parent_guardian_names: string
  parent_phone: string
  parent_email: string
  preferred_communication_method: 'text' | 'email'
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string
  address?: string
}

export interface PickupInformation {
  authorized_pickup_persons?: string
  custody_restrictions?: string
}

export interface MediaPermission {
  media_permission: boolean
}

export interface TermsAcceptance {
  terms_accepted: boolean
  terms_accepted_date: string
}

// Database models
export interface Parent {
  id: string
  user_id?: string
  parent_guardian_names: string
  parent_phone: string
  parent_email: string
  preferred_communication_method: 'text' | 'email'
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface Child {
  id: string
  parent_id: string

  // Child Information
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

  // Pick-Up Information
  authorized_pickup_persons?: string
  custody_restrictions?: string

  // Media Permission
  media_permission: boolean

  created_at: string
  updated_at: string
}

export interface ParentWithChildren extends Parent {
  children: Child[]
}

// Complete child data for forms
export interface ChildData
  extends ChildInformation,
          HealthAndSafety,
          PickupInformation,
          MediaPermission {
  id?: string
}

// Legacy - for backward compatibility
export interface StudentRegistrationData
  extends ChildInformation,
          HealthAndSafety,
          ParentInformation,
          PickupInformation,
          MediaPermission {
  id?: string
  created_at?: string
  updated_at?: string
}

// Form step data for multi-step form (multi-child version)
export interface SignupFormDataMultiChild {
  // Auth credentials
  email: string
  password: string

  // Parent Information (Step 1)
  parentInfo: ParentInformation

  // Children (can have multiple)
  children: ChildData[]
}

// Form step data for single-child signup questionnaire
export interface SignupFormData {
  // Auth credentials
  email: string
  password: string

  // Child Information
  childInfo: ChildInformation

  // Health & Safety
  healthSafety: HealthAndSafety

  // Parent Information
  parentInfo: ParentInformation

  // Pick-Up Information
  pickupInfo: PickupInformation

  // Media Permission
  mediaPermission: MediaPermission

  // Terms Acceptance
  termsAcceptance: TermsAcceptance
}

export type SignupStep =
  | 'account'
  | 'child-info'
  | 'health-safety'
  | 'parent-info'
  | 'pickup-info'
  | 'media-permission'
  | 'terms-acceptance'
  | 'children-list'
  | 'review'
