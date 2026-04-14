import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const invoice = await prisma.invoice.findFirst({
      where: { id, userId },
      include: {
        client: true,
        items: true,
        payments: { orderBy: { paidAt: "desc" } },
        user: {
          select: {
            name: true,
            email: true,
            businessName: true,
            gstin: true,
            pan: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            pincode: true,
            logoUrl: true,
            signature: true,
            // ✅ Payment fields
            upiId: true,
            bankName: true,
            bankAccount: true,
            bankIfsc: true,
            bankBranch: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ data: invoice }, { status: 200 });
  } catch (error) {
    console.error("GET invoice error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
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

    const body = await req.json();
    const {
      clientId,
      issueDate,
      dueDate,
      status,
      items,
      discountType,
      discountValue,
      isGst,
      gstType,
      notes,
      terms,
    } = body;

    const existing = await prisma.invoice.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.rate,
      0,
    );

    let discountAmount = 0;
    if (discountType === "PERCENTAGE") {
      discountAmount = (subtotal * (discountValue || 0)) / 100;
    } else {
      discountAmount = discountValue || 0;
    }

    const afterDiscount = subtotal - discountAmount;

    let cgst = 0,
      sgst = 0,
      igst = 0,
      totalTax = 0;
    if (isGst) {
      totalTax = items.reduce((sum: number, item: any) => {
        return sum + (item.quantity * item.rate * (item.taxRate || 18)) / 100;
      }, 0);
      if (gstType === "CGST_SGST") {
        cgst = totalTax / 2;
        sgst = totalTax / 2;
      } else if (gstType === "IGST") {
        igst = totalTax;
      }
    }

    const total = afterDiscount + totalTax;
    const amountDue = total - existing.amountPaid;

    const invoice = await prisma.$transaction(async (tx) => {
      await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });

      return tx.invoice.update({
        where: { id },
        data: {
          clientId,
          issueDate: issueDate ? new Date(issueDate) : existing.issueDate,
          dueDate: new Date(dueDate),
          status: status || existing.status,
          subtotal,
          discountType: discountType || "PERCENTAGE",
          discountValue: discountValue || 0,
          discountAmount,
          isGst: isGst ?? true,
          gstType: gstType || "CGST_SGST",
          cgst,
          sgst,
          igst,
          totalTax,
          total,
          amountDue,
          notes: notes || null,
          terms: terms || null,
          items: {
            create: items.map((item: any) => ({
              name: item.name,
              description: item.description || null,
              hsnCode: item.hsnCode || null,
              quantity: item.quantity,
              unit: item.unit || "nos",
              rate: item.rate,
              amount: item.quantity * item.rate,
              taxRate: item.taxRate || 18,
              taxAmount:
                (item.quantity * item.rate * (item.taxRate || 18)) / 100,
            })),
          },
        },
        include: { items: true, client: true, payments: true },
      });
    });

    return NextResponse.json({ data: invoice }, { status: 200 });
  } catch (error) {
    console.error("PUT invoice error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
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

    const existing = await prisma.invoice.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    await prisma.invoice.delete({ where: { id } });

    return NextResponse.json(
      { message: "Invoice deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE invoice error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
