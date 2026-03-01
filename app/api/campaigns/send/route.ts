import { NextRequest } from "next/server";
import {
  sendCampaignEmail,
  CampaignRecipient,
  CampaignProgress,
  CAMPAIGN_CONFIG,
  verifyEmailConnection,
  ClassContext,
} from "@/lib/email";
import { getEmailTemplate, recordEmailSendsBatch } from "@/lib/supabase";

interface CampaignRequest {
  templateId: string;
  recipients: CampaignRecipient[];
  classContext?: ClassContext;
}

function createSSEMessage(data: CampaignProgress): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const body: CampaignRequest = await request.json();
        const { templateId, recipients, classContext } = body;

        // Validate request
        if (!templateId) {
          const errorProgress: CampaignProgress = {
            total: 0,
            sent: 0,
            failed: 0,
            currentBatch: 0,
            totalBatches: 0,
            errors: [{ email: "system", error: "Template ID is required" }],
            status: "failed",
          };
          controller.enqueue(encoder.encode(createSSEMessage(errorProgress)));
          controller.close();
          return;
        }

        if (!recipients || recipients.length === 0) {
          const errorProgress: CampaignProgress = {
            total: 0,
            sent: 0,
            failed: 0,
            currentBatch: 0,
            totalBatches: 0,
            errors: [{ email: "system", error: "No recipients provided" }],
            status: "failed",
          };
          controller.enqueue(encoder.encode(createSSEMessage(errorProgress)));
          controller.close();
          return;
        }

        // Filter invalid emails
        const validRecipients = recipients.filter(
          (r) => r.email && isValidEmail(r.email.trim())
        );

        if (validRecipients.length === 0) {
          const errorProgress: CampaignProgress = {
            total: 0,
            sent: 0,
            failed: 0,
            currentBatch: 0,
            totalBatches: 0,
            errors: [{ email: "system", error: "No valid email addresses found" }],
            status: "failed",
          };
          controller.enqueue(encoder.encode(createSSEMessage(errorProgress)));
          controller.close();
          return;
        }

        // Verify SMTP connection
        const isConnected = await verifyEmailConnection();
        if (!isConnected) {
          const errorProgress: CampaignProgress = {
            total: validRecipients.length,
            sent: 0,
            failed: 0,
            currentBatch: 0,
            totalBatches: 0,
            errors: [
              {
                email: "system",
                error: "Failed to connect to SMTP server. Check email configuration.",
              },
            ],
            status: "failed",
          };
          controller.enqueue(encoder.encode(createSSEMessage(errorProgress)));
          controller.close();
          return;
        }

        // Fetch template
        let template;
        try {
          template = await getEmailTemplate(templateId);
        } catch {
          const errorProgress: CampaignProgress = {
            total: validRecipients.length,
            sent: 0,
            failed: 0,
            currentBatch: 0,
            totalBatches: 0,
            errors: [{ email: "system", error: "Email template not found" }],
            status: "failed",
          };
          controller.enqueue(encoder.encode(createSSEMessage(errorProgress)));
          controller.close();
          return;
        }

        // Initialize progress
        const totalBatches = Math.ceil(
          validRecipients.length / CAMPAIGN_CONFIG.BATCH_SIZE
        );
        const progress: CampaignProgress = {
          total: validRecipients.length,
          sent: 0,
          failed: 0,
          currentBatch: 0,
          totalBatches,
          errors: [],
          status: "running",
        };

        controller.enqueue(encoder.encode(createSSEMessage(progress)));

        // Process recipients in batches
        for (let i = 0; i < validRecipients.length; i += CAMPAIGN_CONFIG.BATCH_SIZE) {
          const batch = validRecipients.slice(i, i + CAMPAIGN_CONFIG.BATCH_SIZE);
          progress.currentBatch = Math.floor(i / CAMPAIGN_CONFIG.BATCH_SIZE) + 1;

          // Send emails in current batch concurrently
          const batchResults = await Promise.all(
            batch.map(async (recipient) => {
              const result = await sendCampaignEmail({
                recipient: {
                  ...recipient,
                  email: recipient.email.trim(),
                },
                subject: template.subject,
                html: template.html_content,
                classContext,
              });

              const contactName = `${recipient.first_name || ""} ${recipient.last_name || ""}`.trim() || "No name";

              return {
                email: recipient.email.trim(),
                contactName,
                ...result,
              };
            })
          );

          // Record sends to database (non-blocking)
          const sendRecords = batchResults.map((result) => ({
            template_id: templateId,
            contact_email: result.email,
            contact_name: result.contactName,
            status: result.success ? "sent" as const : "failed" as const,
            error_message: result.error || null,
          }));

          recordEmailSendsBatch(sendRecords).catch((err) => {
            console.error("Failed to record email sends:", err);
          });

          // Update progress
          for (const result of batchResults) {
            if (result.success) {
              progress.sent++;
            } else {
              progress.failed++;
              progress.errors.push({
                email: result.email,
                error: result.error || "Unknown error",
              });
            }
          }

          controller.enqueue(encoder.encode(createSSEMessage(progress)));

          // Delay between batches
          if (i + CAMPAIGN_CONFIG.BATCH_SIZE < validRecipients.length) {
            await delay(CAMPAIGN_CONFIG.DELAY_BETWEEN_BATCHES_MS);
          }
        }

        progress.status = "completed";
        controller.enqueue(encoder.encode(createSSEMessage(progress)));
        controller.close();
      } catch (error) {
        const errorProgress: CampaignProgress = {
          total: 0,
          sent: 0,
          failed: 0,
          currentBatch: 0,
          totalBatches: 0,
          errors: [
            {
              email: "system",
              error:
                error instanceof Error
                  ? error.message
                  : "An unexpected error occurred",
            },
          ],
          status: "failed",
        };
        controller.enqueue(encoder.encode(createSSEMessage(errorProgress)));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
