import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { updateEmailTemplate, deleteEmailTemplate } from "@/lib/supabase";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, subject, html_content } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    const template = await updateEmailTemplate(id, {
      ...(name && { name }),
      ...(subject && { subject }),
      ...(html_content && { html_content }),
    });

    revalidatePath("/dashboard/emails");
    return NextResponse.json({ success: true, template });
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update template" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    await deleteEmailTemplate(id);

    revalidatePath("/dashboard/emails");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete template" },
      { status: 500 }
    );
  }
}
