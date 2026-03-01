import { NextRequest, NextResponse } from "next/server";
import { getEmailTemplate } from "@/lib/supabase";
import { sendTestEmail, personalizeEmailContent, ClassContext } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { email, classContext } = body as { email: string; classContext?: ClassContext };

    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    const template = await getEmailTemplate(id);

    // Personalize with test recipient and optional class context
    const testRecipient = { email, first_name: "Test", last_name: "User" };
    const personalizedSubject = personalizeEmailContent(template.subject, testRecipient, classContext);
    const personalizedHtml = personalizeEmailContent(template.html_content, testRecipient, classContext);

    await sendTestEmail({
      to: email,
      subject: personalizedSubject,
      html: personalizedHtml,
    });

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${email}`,
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send test email" },
      { status: 500 }
    );
  }
}
