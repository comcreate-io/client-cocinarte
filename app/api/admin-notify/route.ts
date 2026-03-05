import { NextResponse } from "next/server";
import { sendAdminNotification, AdminNotificationType } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { success: false, error: "Missing type or data" },
        { status: 400 }
      );
    }

    const result = await sendAdminNotification(type as AdminNotificationType, data);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin notification error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
