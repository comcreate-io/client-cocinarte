export interface PartyGuest {
  id: string
  party_request_id: string
  child_name: string
  parent_name: string
  parent_email: string
  form_token: string
  guest_child_id: string | null
  form_completed_at: string | null
  email_sent_at: string | null
  created_at: string
  updated_at: string
}

export interface PartyRequestWithToken {
  id: string
  preferred_date: string
  number_of_children: number
  package: string
  parent_name: string
  phone: string
  email: string
  child_name_age: string | null
  special_requests: string | null
  status: 'pending' | 'approved' | 'declined'
  dashboard_token: string
  created_at: string
  updated_at: string
}

export interface AddPartyGuestPayload {
  dashboard_token: string
  child_name: string
  parent_name: string
  parent_email: string
}
