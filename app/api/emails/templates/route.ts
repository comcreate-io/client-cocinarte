import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createEmailTemplate } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, subject, html_content } = body;

    if (!name || !subject || !html_content) {
      return NextResponse.json(
        { error: "Name, subject, and HTML content are required" },
        { status: 400 }
      );
    }

    const template = await createEmailTemplate({
      name,
      subject,
      html_content,
    });

    revalidatePath("/dashboard/emails");
    return NextResponse.json({ success: true, template });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create template" },
      { status: 500 }
    );
  }
}
