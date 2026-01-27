import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { syncParentsToEmailContacts } from "@/lib/supabase";

export async function POST() {
  try {
    const result = await syncParentsToEmailContacts();

    revalidatePath("/dashboard/emails");
    return NextResponse.json({
      success: true,
      synced: result.synced,
      message: result.synced > 0
        ? `Successfully synced ${result.synced} parent(s) to email contacts`
        : "All parents are already synced to email contacts",
    });
  } catch (error) {
    console.error("Error syncing parents:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to sync parents" },
      { status: 500 }
    );
  }
}
