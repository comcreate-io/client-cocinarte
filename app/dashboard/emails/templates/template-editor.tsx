"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Code, Loader2 } from "lucide-react";
import type { EmailTemplate } from "@/lib/supabase";

interface TemplateEditorProps {
  template?: EmailTemplate;
}

export function TemplateEditor({ template }: TemplateEditorProps) {
  const router = useRouter();
  const [name, setName] = useState(template?.name || "");
  const [subject, setSubject] = useState(template?.subject || "");
  const [htmlContent, setHtmlContent] = useState(template?.html_content || getDefaultTemplate());
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!name.trim()) {
      setError("Template name is required");
      return;
    }
    if (!subject.trim()) {
      setError("Subject line is required");
      return;
    }
    if (!htmlContent.trim()) {
      setError("HTML content is required");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const url = template
        ? `/api/emails/templates/${template.id}`
        : "/api/emails/templates";
      const method = template ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          subject: subject.trim(),
          html_content: htmlContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save template");
      }

      router.push("/dashboard/emails");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save template");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/dashboard/emails")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Emails
      </button>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Template Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Welcome Email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Subject Line</label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Welcome to our newsletter!"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            HTML Content
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(false)}
              className={`flex items-center gap-1 px-3 py-1 text-sm rounded-md transition-colors ${
                !showPreview
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <Code className="h-4 w-4" />
              Code
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className={`flex items-center gap-1 px-3 py-1 text-sm rounded-md transition-colors ${
                showPreview
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground mb-2">
          Available variables: {"{{first_name}}"}, {"{{last_name}}"}, {"{{email}}"}, {"{{full_name}}"}
        </div>

        {showPreview ? (
          <div className="border rounded-lg p-4 min-h-[400px] bg-white overflow-auto">
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>
        ) : (
          <textarea
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            className="w-full h-[400px] p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            placeholder="Enter your HTML email template..."
          />
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.push("/dashboard/emails")}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            template ? "Update Template" : "Create Template"
          )}
        </Button>
      </div>
    </div>
  );
}

function getDefaultTemplate() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="padding: 40px 30px;">
        <h1 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Hello {{first_name}}!</h1>
        <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;">
          This is your email content. Edit this template to create your custom email.
        </p>
        <a href="#" style="display: inline-block; padding: 12px 24px; background-color: #F0614F; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 16px;">
          Call to Action
        </a>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 30px; background-color: #f8f8f8; text-align: center;">
        <p style="margin: 0; color: #999999; font-size: 12px;">
          &copy; 2024 Cocinarte PDX. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
