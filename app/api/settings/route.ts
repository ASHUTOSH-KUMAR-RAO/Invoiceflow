import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
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
        currency: true,
        invoicePrefix: true,
        nextInvoiceNo: true,
        upiId: true,
        bankName: true,
        bankAccount: true,
        bankIfsc: true,
        bankBranch: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ data: user }, { status: 200 });
  } catch (error) {
    console.error("GET settings error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      businessName,
      gstin,
      pan,
      phone,
      address,
      city,
      state,
      pincode,
      currency,
      invoicePrefix,
      upiId,
      bankName,
      bankAccount,
      bankIfsc,
      bankBranch,
    } = body;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || null,
        businessName: businessName || null,
        gstin: gstin || null,
        pan: pan || null,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        currency: currency || "INR",
        invoicePrefix: invoicePrefix || "INV",
        upiId: upiId || null,
        bankName: bankName || null,
        bankAccount: bankAccount || null,
        bankIfsc: bankIfsc || null,
        bankBranch: bankBranch || null,
      },
      select: {
        id: true,
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
        currency: true,
        invoicePrefix: true,
        upiId: true,
        bankName: true,
        bankAccount: true,
        bankIfsc: true,
        bankBranch: true,
      },
    });

    return NextResponse.json({ data: user }, { status: 200 });
  } catch (error) {
    console.error("PUT settings error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
