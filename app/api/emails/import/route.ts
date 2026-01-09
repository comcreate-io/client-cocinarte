import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { insertEmailContacts } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contacts } = body;

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json(
        { error: "No contacts provided" },
        { status: 400 }
      );
    }

    // Validate contacts
    const validContacts = contacts.filter(
      (contact: { first_name?: string; last_name?: string; email: string }) =>
        contact.email && contact.email.includes("@")
    );

    if (validContacts.length === 0) {
      return NextResponse.json(
        { error: "No valid contacts found" },
        { status: 400 }
      );
    }

    const imported = await insertEmailContacts(validContacts);

    revalidatePath("/dashboard/emails");
    return NextResponse.json({
      success: true,
      imported: imported.length,
    });
  } catch (error) {
    console.error("Error importing contacts:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to import contacts" },
      { status: 500 }
    );
  }
}
