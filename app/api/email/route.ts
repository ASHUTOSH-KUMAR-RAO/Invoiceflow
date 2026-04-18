import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  sendWelcomeEmail,
  sendInvoiceEmail,
  sendReminderEmail,
} from "@/lib/email";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type } = body;

    if (!type) {
      return NextResponse.json(
        { error: "Email type required" },
        { status: 400 },
      );
    }

    // ==========================================
    // WELCOME EMAIL
    // ==========================================
    if (type === "welcome") {
      const { to, name } = body;
      if (!to || !name) {
        return NextResponse.json(
          { error: "Missing fields: to, name" },
          { status: 400 },
        );
      }
      const result = await sendWelcomeEmail({ to, name });
      return NextResponse.json(
        { success: true, data: result },
        { status: 200 },
      );
    }

    // ==========================================
    // INVOICE EMAIL
    // ==========================================
    if (type === "invoice") {
      const { to, clientName, invoiceNumber, amount, dueDate, invoiceUrl } =
        body;
      if (
        !to ||
        !clientName ||
        !invoiceNumber ||
        !amount ||
        !dueDate ||
        !invoiceUrl
      ) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 },
        );
      }
      const result = await sendInvoiceEmail({
        to,
        clientName,
        invoiceNumber,
        amount,
        dueDate,
        invoiceUrl,
      });
      return NextResponse.json(
        { success: true, data: result },
        { status: 200 },
      );
    }

    // ==========================================
    // REMINDER EMAIL
    // ==========================================
    if (type === "reminder") {
      const { to, clientName, invoiceNumber, amount, dueDate, message } = body;
      if (
        !to ||
        !clientName ||
        !invoiceNumber ||
        !amount ||
        !dueDate ||
        !message
      ) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 },
        );
      }
      const result = await sendReminderEmail({
        to,
        clientName,
        invoiceNumber,
        amount,
        dueDate,
        message,
      });
      return NextResponse.json(
        { success: true, data: result },
        { status: 200 },
      );
    }

    return NextResponse.json({ error: "Invalid email type" }, { status: 400 });
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
