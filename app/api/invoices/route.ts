import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(search && {
        OR: [
          { invoiceNumber: { contains: search, mode: "insensitive" as const } },
          {
            client: {
              name: { contains: search, mode: "insensitive" as const },
            },
          },
        ],
      }),
    };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: { client: true, items: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json(
      { data: invoices, total, page, limit },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET invoices error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await req.json();

    const {
      clientId,
      invoiceNumber,
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

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        userId,
        clientId,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        dueDate: new Date(dueDate),
        status: status || "DRAFT",
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
        amountPaid: 0,
        amountDue: total,
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
            taxAmount: (item.quantity * item.rate * (item.taxRate || 18)) / 100,
          })),
        },
      },
      include: { items: true, client: true },
    });

    return NextResponse.json({ data: invoice }, { status: 201 });
  } catch (error) {
    console.error("POST invoice error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
