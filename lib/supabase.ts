import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============ EMAIL MARKETING INTERFACES ============

export interface EmailContact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  created_at: string;
  updated_at: string;
}

export interface EmailSend {
  id: string;
  template_id: string;
  contact_email: string;
  contact_name: string;
  status: "sent" | "failed";
  error_message: string | null;
  sent_at: string;
}

export interface EmailSendWithTemplate extends EmailSend {
  template_name?: string;
  template_subject?: string;
}

// ============ EMAIL CONTACTS ============

export async function getEmailContacts() {
  const { data, error } = await supabase
    .from("email_contacts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as EmailContact[];
}

export async function insertEmailContacts(
  contacts: Omit<EmailContact, "id" | "created_at">[]
) {
  const { data, error } = await supabase
    .from("email_contacts")
    .insert(contacts)
    .select();

  if (error) throw new Error(error.message);
  return data as EmailContact[];
}

export async function deleteEmailContact(id: string) {
  const { error } = await supabase
    .from("email_contacts")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}

// ============ EMAIL TEMPLATES ============

export async function getEmailTemplates() {
  const { data, error } = await supabase
    .from("email_templates")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as EmailTemplate[];
}

export async function getEmailTemplate(id: string) {
  const { data, error } = await supabase
    .from("email_templates")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data as EmailTemplate;
}

export async function createEmailTemplate(
  template: Omit<EmailTemplate, "id" | "created_at" | "updated_at">
) {
  const { data, error } = await supabase
    .from("email_templates")
    .insert(template)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as EmailTemplate;
}

export async function updateEmailTemplate(
  id: string,
  template: Partial<Omit<EmailTemplate, "id" | "created_at" | "updated_at">>
) {
  const { data, error } = await supabase
    .from("email_templates")
    .update({ ...template, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as EmailTemplate;
}

export async function deleteEmailTemplate(id: string) {
  const { error } = await supabase
    .from("email_templates")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}

// ============ EMAIL SENDS TRACKING ============

export async function recordEmailSend(
  send: Omit<EmailSend, "id" | "sent_at">
) {
  const { data, error } = await supabase
    .from("email_sends")
    .insert(send)
    .select()
    .single();

  if (error) {
    console.error("Failed to record email send:", error.message);
    return null;
  }
  return data as EmailSend;
}

export async function recordEmailSendsBatch(
  sends: Omit<EmailSend, "id" | "sent_at">[]
) {
  if (sends.length === 0) return [];

  const { data, error } = await supabase
    .from("email_sends")
    .insert(sends)
    .select();

  if (error) {
    console.error("Failed to record email sends batch:", error.message);
    return [];
  }
  return data as EmailSend[];
}

export async function getEmailSendsByTemplate(templateId: string) {
  const { data, error } = await supabase
    .from("email_sends")
    .select("*")
    .eq("template_id", templateId)
    .order("sent_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as EmailSend[];
}

export async function getEmailSendsByContact(contactEmail: string) {
  const { data, error } = await supabase
    .from("email_sends")
    .select(`
      *,
      email_templates (
        name,
        subject
      )
    `)
    .eq("contact_email", contactEmail)
    .order("sent_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data.map((send: { email_templates: { name: string; subject: string } | null } & EmailSend) => ({
    ...send,
    template_name: send.email_templates?.name,
    template_subject: send.email_templates?.subject,
  })) as EmailSendWithTemplate[];
}

export async function getTemplateSendStats(templateId: string) {
  const { data, error } = await supabase
    .from("email_sends")
    .select("status")
    .eq("template_id", templateId);

  if (error) throw new Error(error.message);

  const total = data.length;
  const sent = data.filter((s: { status: string }) => s.status === "sent").length;
  const failed = data.filter((s: { status: string }) => s.status === "failed").length;

  return { total, sent, failed };
}

// ============ PARENTS TABLE SYNC ============

export interface ParentContact {
  id: string;
  parent_guardian_names: string;
  parent_email: string;
  created_at: string;
}

export async function getParentsAsContacts() {
  const { data, error } = await supabase
    .from("parents")
    .select("id, parent_guardian_names, parent_email, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as ParentContact[];
}

export async function syncParentsToEmailContacts() {
  // Get all parents
  const { data: parents, error: parentsError } = await supabase
    .from("parents")
    .select("parent_guardian_names, parent_email");

  if (parentsError) throw new Error(parentsError.message);
  if (!parents || parents.length === 0) return { synced: 0 };

  // Get existing email contacts
  const { data: existingContacts, error: contactsError } = await supabase
    .from("email_contacts")
    .select("email");

  if (contactsError) throw new Error(contactsError.message);

  const existingEmails = new Set(
    (existingContacts || []).map((c: { email: string }) => c.email.toLowerCase())
  );

  // Filter out parents that are already in email_contacts
  const newContacts = parents
    .filter((p: ParentContact) => !existingEmails.has(p.parent_email.toLowerCase()))
    .map((p: ParentContact) => {
      const names = (p.parent_guardian_names || "").split(" ");
      return {
        first_name: names[0] || "",
        last_name: names.slice(1).join(" ") || "",
        email: p.parent_email.toLowerCase(),
      };
    });

  if (newContacts.length === 0) return { synced: 0 };

  // Insert new contacts
  const { error: insertError } = await supabase
    .from("email_contacts")
    .insert(newContacts);

  if (insertError) throw new Error(insertError.message);

  return { synced: newContacts.length };
}
