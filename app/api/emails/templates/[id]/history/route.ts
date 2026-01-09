import { NextRequest, NextResponse } from "next/server";
import { getEmailSendsByTemplate } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const sends = await getEmailSendsByTemplate(id);

    return NextResponse.json({ sends });
  } catch (error) {
    console.error("Failed to fetch template history:", error);
    return NextResponse.json(
      { error: "Failed to fetch send history" },
      { status: 500 }
    );
  }
}
