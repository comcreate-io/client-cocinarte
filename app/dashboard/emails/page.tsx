import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getEmailContacts, getEmailTemplates } from "@/lib/supabase";
import { formatDate, getInitials } from "@/lib/utils";
import { AddContactForm } from "./add-contact-form";
import { DeleteContactButton } from "./delete-contact-button";
import { TemplateList } from "./template-list";

export default async function EmailsPage() {
  let contacts = null;
  let templates = null;
  let contactsError = null;
  let templatesError = null;

  try {
    contacts = await getEmailContacts();
  } catch (e) {
    contactsError = e instanceof Error ? e.message : "Failed to load email contacts";
  }

  try {
    templates = await getEmailTemplates();
  } catch (e) {
    templatesError = e instanceof Error ? e.message : "Failed to load email templates";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Emails</h1>
        <p className="text-sm text-muted-foreground">
          Manage email templates and contacts
        </p>
      </div>

      {/* Email Templates Section */}
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
        </CardHeader>
        <CardContent>
          {templatesError ? (
            <p className="text-destructive">{templatesError}</p>
          ) : (
            <TemplateList
              templates={templates || []}
              contacts={(contacts || []).map(c => ({
                id: c.id,
                email: c.email,
                first_name: c.first_name,
                last_name: c.last_name
              }))}
            />
          )}
        </CardContent>
      </Card>

      {/* Contacts List */}
      {contactsError ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">{contactsError}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>
              Email Contacts {contacts && contacts.length > 0 && `(${contacts.length})`}
            </CardTitle>
            <AddContactForm />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts?.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                          {getInitials(contact.first_name, contact.last_name)}
                        </div>
                        <div>
                          <p className="font-medium">
                            {contact.first_name || contact.last_name
                              ? `${contact.first_name || ""} ${contact.last_name || ""}`.trim()
                              : "No name"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {contact.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(contact.created_at)}
                    </TableCell>
                    <TableCell>
                      <DeleteContactButton id={contact.id} email={contact.email} />
                    </TableCell>
                  </TableRow>
                ))}
                {(!contacts || contacts.length === 0) && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-8"
                    >
                      No email contacts yet. Add a contact or import a CSV file to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
