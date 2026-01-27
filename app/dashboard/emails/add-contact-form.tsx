"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Upload, FileText, X, AlertCircle, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ParsedContact {
  first_name: string;
  last_name: string;
  email: string;
}

export function AddContactForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"manual" | "csv" | "parents">("manual");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
  });

  // CSV state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParsedContact[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync parents state
  const [syncResult, setSyncResult] = useState<{ synced: number; message: string } | null>(null);

  const router = useRouter();

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
    setFormData({ email: "", first_name: "", last_name: "" });
    setFile(null);
    setPreview([]);
    setSyncResult(null);
    setActiveTab("manual");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  async function handleSyncParents() {
    setIsSubmitting(true);
    setError(null);
    setSyncResult(null);

    try {
      const response = await fetch("/api/emails/sync-parents", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync parents");
      }

      setSyncResult({ synced: data.synced, message: data.message });
      if (data.synced > 0) {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync parents");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/emails/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contacts: [
            {
              email: formData.email.trim().toLowerCase(),
              first_name: formData.first_name.trim(),
              last_name: formData.last_name.trim(),
            },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add contact");
      }

      handleClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add contact");
    } finally {
      setIsSubmitting(false);
    }
  };

  // CSV parsing function
  function parseCSV(text: string): ParsedContact[] {
    const lines = text.trim().split("\n");
    if (lines.length < 2) {
      throw new Error("CSV file must have a header row and at least one data row");
    }

    const header = lines[0].toLowerCase().split(",").map((h) => h.trim());

    const firstNameIndex = header.findIndex((h) =>
      h === "first_name" || h === "firstname" || h === "first name" || h === "name"
    );
    const lastNameIndex = header.findIndex((h) =>
      h === "last_name" || h === "lastname" || h === "last name" || h === "surname"
    );
    const emailIndex = header.findIndex((h) =>
      h === "email" || h === "email address" || h === "e-mail"
    );

    if (emailIndex === -1) {
      throw new Error("CSV must have an 'email' column");
    }

    const contacts: ParsedContact[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));

      const email = values[emailIndex];
      if (!email || !email.includes("@")) continue;

      contacts.push({
        first_name: firstNameIndex !== -1 ? values[firstNameIndex] || "" : "",
        last_name: lastNameIndex !== -1 ? values[lastNameIndex] || "" : "",
        email: email,
      });
    }

    return contacts;
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please select a CSV file");
      return;
    }

    setFile(selectedFile);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const contacts = parseCSV(text);
        if (contacts.length === 0) {
          setError("No valid contacts found in the CSV file");
          return;
        }
        setPreview(contacts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse CSV file");
        setPreview([]);
      }
    };
    reader.readAsText(selectedFile);
  }

  async function handleCSVUpload() {
    if (preview.length === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/emails/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: preview }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to import contacts");
      }

      handleClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import contacts");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClearFile() {
    setFile(null);
    setPreview([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Contact
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Contacts</DialogTitle>
            <DialogDescription>
              Add a single contact or import multiple from a CSV file.
            </DialogDescription>
          </DialogHeader>

          {/* Tabs */}
          <div className="border-b">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => { setActiveTab("manual"); setError(null); }}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "manual"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Manual Entry
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab("csv"); setError(null); }}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "csv"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Import CSV
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab("parents"); setError(null); setSyncResult(null); }}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "parents"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Sync Parents
              </button>
            </div>
          </div>

          {activeTab === "manual" ? (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      placeholder="John"
                      className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      placeholder="Doe"
                      className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Contact"
                  )}
                </Button>
              </DialogFooter>
            </form>
          ) : activeTab === "csv" ? (
            <div>
              <div className="space-y-4 py-4">
                {/* Upload Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">
                    Click to upload CSV file
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Required: email. Optional: first_name, last_name
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {/* File Selected */}
                {file && !error && (
                  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {preview.length} contacts found
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearFile}
                      className="p-1 hover:bg-border rounded"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                )}

                {/* Preview */}
                {preview.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Preview (first 5 contacts)
                    </p>
                    <div className="border rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-secondary sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                              Name
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                              Email
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {preview.slice(0, 5).map((contact, index) => (
                            <tr key={index} className="border-t">
                              <td className="px-3 py-2">
                                {contact.first_name || contact.last_name
                                  ? `${contact.first_name} ${contact.last_name}`.trim()
                                  : "-"}
                              </td>
                              <td className="px-3 py-2">
                                {contact.email}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleCSVUpload}
                  disabled={isSubmitting || preview.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    `Import ${preview.length} Contact${preview.length !== 1 ? "s" : ""}`
                  )}
                </Button>
              </DialogFooter>
            </div>
          ) : activeTab === "parents" ? (
            <div>
              <div className="space-y-4 py-4">
                <div className="text-center py-4">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Sync from Parents</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Import all registered parents from your database as email contacts.
                    This will only add parents who are not already in your email contacts list.
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {/* Success Message */}
                {syncResult && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    <p className="text-sm">{syncResult.message}</p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  {syncResult ? "Close" : "Cancel"}
                </Button>
                {!syncResult && (
                  <Button
                    type="button"
                    onClick={handleSyncParents}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <Users className="h-4 w-4 mr-2" />
                        Sync Parents
                      </>
                    )}
                  </Button>
                )}
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
