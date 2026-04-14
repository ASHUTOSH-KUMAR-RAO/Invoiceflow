import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { id } = await params;

    const { amount, method, transactionId, notes, paidAt } = await req.json();

    const invoice = await prisma.invoice.findFirst({
      where: { id, userId },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (amount <= 0 || amount > invoice.amountDue) {
      return NextResponse.json(
        { error: "Invalid payment amount" },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          invoiceId: id,
          amount,
          method: method || "UPI",
          transactionId: transactionId || null,
          notes: notes || null,
          paidAt: paidAt ? new Date(paidAt) : new Date(),
        },
      });

      const newAmountPaid = invoice.amountPaid + amount;
      const newAmountDue = invoice.total - newAmountPaid;
      const newStatus = newAmountDue <= 0 ? "PAID" : "PARTIAL";

      await tx.invoice.update({
        where: { id },
        data: {
          amountPaid: newAmountPaid,
          amountDue: newAmountDue,
          status: newStatus as any,
          paidAt: newStatus === "PAID" ? new Date() : null,
        },
      });

      return payment;
    });

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    console.error("POST payment error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { id } = await params;

    // Pehle check karo invoice is user ka hai
    const invoice = await prisma.invoice.findFirst({
      where: { id, userId },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const payments = await prisma.payment.findMany({
      where: { invoiceId: id },
      orderBy: { paidAt: "desc" },
    });

    return NextResponse.json({ data: payments }, { status: 200 });
  } catch (error) {
    console.error("GET payments error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
