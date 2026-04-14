import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clientSchema } from "@/lib/validations";

// GET — ek client fetch karo by id
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const client = await prisma.client.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        _count: { select: { invoices: true } },
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            total: true,
            amountDue: true,
            status: true,
            issueDate: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ data: client }, { status: 200 });
  } catch (error) {
    console.error("GET client error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT — client update karo
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = clientSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.errors },
        { status: 400 },
      );
    }

    // Pehle check karo client exist karta hai ya nahi
    const existing = await prisma.client.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...parsed.data,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        gstin: parsed.data.gstin || null,
        pan: parsed.data.pan || null,
        address: parsed.data.address || null,
        city: parsed.data.city || null,
        state: parsed.data.state || null,
        pincode: parsed.data.pincode || null,
        notes: parsed.data.notes || null,
      },
    });

    return NextResponse.json({ data: client }, { status: 200 });
  } catch (error) {
    console.error("PUT client error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE — client delete karo
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Pehle check karo client exist karta hai ya nahi
    const existing = await prisma.client.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Client deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE client error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
