"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Send,
  Eye,
  Edit,
  Trash2,
  History,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Clock,
} from "lucide-react";
import type { EmailTemplate, EmailSend } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

interface Contact {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface TemplateListProps {
  templates: EmailTemplate[];
  contacts: Contact[];
}

interface CampaignProgress {
  total: number;
  sent: number;
  failed: number;
  currentBatch: number;
  totalBatches: number;
  errors: Array<{ email: string; error: string }>;
  status: "running" | "completed" | "failed";
}

export function TemplateList({ templates, contacts }: TemplateListProps) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  // Modal states
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Campaign state
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [campaignProgress, setCampaignProgress] = useState<CampaignProgress | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [activityLog, setActivityLog] = useState<Array<{ time: string; message: string; type: "info" | "success" | "error" }>>([]);

  // Test email state
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState(false);

  // History state
  const [history, setHistory] = useState<EmailSend[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Delete state
  const [isDeleting, setIsDeleting] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Reset states when modals close
  const resetCampaignState = () => {
    setSelectedContacts(new Set());
    setCampaignProgress(null);
    setIsSending(false);
    setActivityLog([]);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const resetTestState = () => {
    setTestEmail("");
    setTestError(null);
    setTestSuccess(false);
    setIsSendingTest(false);
  };

  // Handle template actions
  const handleSendCampaign = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowCampaignModal(true);
  };

  const handleSendTest = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowTestModal(true);
  };

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  const handleViewHistory = async (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowHistoryModal(true);
    setIsLoadingHistory(true);

    try {
      const response = await fetch(`/api/emails/templates/${template.id}/history`);
      const data = await response.json();
      if (response.ok) {
        setHistory(data.sends || []);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleDelete = async (template: EmailTemplate) => {
    if (!confirm(`Are you sure you want to delete "${template.name}"? This will also delete all send history for this template.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/emails/templates/${template.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete template");
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete template");
    } finally {
      setIsDeleting(false);
    }
  };

  // Contact selection
  const toggleContact = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const selectAllContacts = () => {
    setSelectedContacts(new Set(contacts.map(c => c.id)));
  };

  const deselectAllContacts = () => {
    setSelectedContacts(new Set());
  };

  // Send campaign
  const startCampaign = async () => {
    if (!selectedTemplate || selectedContacts.size === 0) return;

    setIsSending(true);
    setActivityLog([{ time: new Date().toLocaleTimeString(), message: "Starting campaign...", type: "info" }]);

    const recipients = contacts
      .filter(c => selectedContacts.has(c.id))
      .map(c => ({
        email: c.email,
        first_name: c.first_name,
        last_name: c.last_name,
      }));

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/campaigns/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          recipients,
        }),
        signal: abortControllerRef.current.signal,
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("Failed to start campaign");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data: CampaignProgress = JSON.parse(line.slice(6));
              setCampaignProgress(data);

              // Update activity log
              if (data.status === "running") {
                setActivityLog(prev => [
                  ...prev,
                  {
                    time: new Date().toLocaleTimeString(),
                    message: `Processing batch ${data.currentBatch}/${data.totalBatches} (${data.sent + data.failed}/${data.total})`,
                    type: "info"
                  }
                ]);
              } else if (data.status === "completed") {
                setActivityLog(prev => [
                  ...prev,
                  {
                    time: new Date().toLocaleTimeString(),
                    message: `Campaign completed! ${data.sent} sent, ${data.failed} failed`,
                    type: data.failed > 0 ? "error" : "success"
                  }
                ]);
              } else if (data.status === "failed") {
                setActivityLog(prev => [
                  ...prev,
                  {
                    time: new Date().toLocaleTimeString(),
                    message: `Campaign failed: ${data.errors[0]?.error || "Unknown error"}`,
                    type: "error"
                  }
                ]);
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        setActivityLog(prev => [
          ...prev,
          { time: new Date().toLocaleTimeString(), message: `Error: ${error.message}`, type: "error" }
        ]);
      }
    } finally {
      setIsSending(false);
    }
  };

  // Send test email
  const sendTestEmail = async () => {
    if (!selectedTemplate || !testEmail) return;

    setIsSendingTest(true);
    setTestError(null);
    setTestSuccess(false);

    try {
      const response = await fetch(`/api/emails/templates/${selectedTemplate.id}/send-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send test email");
      }

      setTestSuccess(true);
    } catch (error) {
      setTestError(error instanceof Error ? error.message : "Failed to send test email");
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link href="/dashboard/emails/templates/new">
          <Button size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Template
          </Button>
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No email templates yet. Create your first template to get started.
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{template.name}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  Subject: {template.subject}
                </p>
                <p className="text-xs text-muted-foreground">
                  Updated: {formatDate(template.updated_at)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleSendCampaign(template)}
                  className="flex items-center gap-1"
                >
                  <Send className="h-3 w-3" />
                  Send
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSendTest(template)}
                  className="flex items-center gap-1"
                >
                  <Mail className="h-3 w-3" />
                  Test
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePreview(template)}
                  className="flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" />
                  Preview
                </Button>
                <Link href={`/dashboard/emails/templates/${template.id}`}>
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewHistory(template)}
                  className="flex items-center gap-1"
                >
                  <History className="h-3 w-3" />
                  History
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(template)}
                  disabled={isDeleting}
                  className="flex items-center gap-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Campaign Modal */}
      <Dialog
        open={showCampaignModal}
        onOpenChange={(open) => {
          if (!open) {
            resetCampaignState();
          }
          setShowCampaignModal(open);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send Campaign: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Select recipients and send your email campaign.
            </DialogDescription>
          </DialogHeader>

          {campaignProgress ? (
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{campaignProgress.sent + campaignProgress.failed} / {campaignProgress.total}</span>
                </div>
                <Progress
                  value={((campaignProgress.sent + campaignProgress.failed) / campaignProgress.total) * 100}
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{campaignProgress.sent}</p>
                  <p className="text-xs text-muted-foreground">Sent</p>
                </div>
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{campaignProgress.failed}</p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <p className="text-2xl font-bold">{campaignProgress.currentBatch}/{campaignProgress.totalBatches}</p>
                  <p className="text-xs text-muted-foreground">Batches</p>
                </div>
              </div>

              {/* Status */}
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                campaignProgress.status === "completed" ? "bg-green-50 text-green-700" :
                campaignProgress.status === "failed" ? "bg-red-50 text-red-700" :
                "bg-blue-50 text-blue-700"
              }`}>
                {campaignProgress.status === "completed" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : campaignProgress.status === "failed" ? (
                  <XCircle className="h-5 w-5" />
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin" />
                )}
                <span className="font-medium capitalize">{campaignProgress.status}</span>
              </div>

              {/* Activity Log */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Activity Log</p>
                <div className="border rounded-lg max-h-40 overflow-y-auto">
                  {activityLog.map((log, i) => (
                    <div key={i} className={`px-3 py-2 text-sm border-b last:border-b-0 flex items-start gap-2 ${
                      log.type === "error" ? "bg-red-50" :
                      log.type === "success" ? "bg-green-50" : ""
                    }`}>
                      <span className="text-muted-foreground text-xs whitespace-nowrap">{log.time}</span>
                      <span>{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Errors */}
              {campaignProgress.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-600">Errors ({campaignProgress.errors.length})</p>
                  <div className="border border-red-200 rounded-lg max-h-32 overflow-y-auto">
                    {campaignProgress.errors.map((error, i) => (
                      <div key={i} className="px-3 py-2 text-sm border-b last:border-b-0 bg-red-50">
                        <span className="font-medium">{error.email}:</span> {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Contact Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Select Recipients ({selectedContacts.size} selected)
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={selectAllContacts}>
                      Select All
                    </Button>
                    <Button size="sm" variant="outline" onClick={deselectAllContacts}>
                      Deselect All
                    </Button>
                  </div>
                </div>

                {contacts.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground border rounded-lg">
                    No contacts available. Add contacts first to send campaigns.
                  </div>
                ) : (
                  <div className="border rounded-lg max-h-60 overflow-y-auto">
                    {contacts.map((contact) => (
                      <label
                        key={contact.id}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-secondary cursor-pointer border-b last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedContacts.has(contact.id)}
                          onChange={() => toggleContact(contact.id)}
                          className="rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {contact.first_name || contact.last_name
                              ? `${contact.first_name || ""} ${contact.last_name || ""}`.trim()
                              : "No name"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            {campaignProgress?.status === "completed" || campaignProgress?.status === "failed" ? (
              <Button onClick={() => {
                resetCampaignState();
                setShowCampaignModal(false);
                router.refresh();
              }}>
                Close
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    resetCampaignState();
                    setShowCampaignModal(false);
                  }}
                  disabled={isSending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={startCampaign}
                  disabled={isSending || selectedContacts.size === 0}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send to {selectedContacts.size} Recipients
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Email Modal */}
      <Dialog
        open={showTestModal}
        onOpenChange={(open) => {
          if (!open) resetTestState();
          setShowTestModal(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Send a test email to preview &quot;{selectedTemplate?.name}&quot;
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {testError && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{testError}</p>
              </div>
            )}

            {testSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                <CheckCircle className="h-4 w-4" />
                <p className="text-sm">Test email sent successfully!</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                resetTestState();
                setShowTestModal(false);
              }}
            >
              Close
            </Button>
            <Button
              onClick={sendTestEmail}
              disabled={isSendingTest || !testEmail || testSuccess}
            >
              {isSendingTest ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Test
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Subject: {selectedTemplate?.subject}
            </DialogDescription>
          </DialogHeader>

          <div className="border rounded-lg p-4 bg-white min-h-[400px] overflow-auto">
            <div dangerouslySetInnerHTML={{ __html: selectedTemplate?.html_content || "" }} />
          </div>

          <DialogFooter>
            <Button onClick={() => setShowPreviewModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Modal */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send History: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              View all emails sent using this template.
            </DialogDescription>
          </DialogHeader>

          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No emails have been sent using this template yet.
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Recipient</th>
                    <th className="px-3 py-2 text-left font-medium">Status</th>
                    <th className="px-3 py-2 text-left font-medium">Sent At</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((send) => (
                    <tr key={send.id} className="border-t">
                      <td className="px-3 py-2">
                        <div>
                          <p className="font-medium">{send.contact_name || "No name"}</p>
                          <p className="text-xs text-muted-foreground">{send.contact_email}</p>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        {send.status === "sent" ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            Sent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600" title={send.error_message || ""}>
                            <XCircle className="h-3 w-3" />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(send.sent_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowHistoryModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
