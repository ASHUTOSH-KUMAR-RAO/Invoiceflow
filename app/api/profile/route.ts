// app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// ─── GET ──────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        plan: true,
        planExpiresAt: true,

        // Business info
        businessName: true,
        gstin: true,
        pan: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        logoUrl: true,
        signature: true,
        currency: true,
        invoicePrefix: true,

        // Payment details
        upiId: true,
        bankName: true,
        bankAccount: true,
        bankIfsc: true,
        bankBranch: true,

        // Notifications
        notifyEmail: true,
        notifyWhatsapp: true,

        // Pending email change
        pendingEmail: true,

        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ─── PATCH ────────────────────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      // Personal
      name, phone, image,
      // Business
      businessName, gstin, pan,
      address, city, state, pincode,
      logoUrl, signature,
      currency, invoicePrefix,
      // Payment
      upiId, bankName, bankAccount, bankIfsc, bankBranch,
      // Notifications
      notifyEmail, notifyWhatsapp,
      // Password change
      currentPassword, newPassword,
      // Email change
      newEmail,
    } = body;

    const updateData: Record<string, unknown> = {};

    // ── Personal ──────────────────────────────────────────────────
    if (name      !== undefined) updateData.name      = name;
    if (phone     !== undefined) updateData.phone     = phone;
    if (image     !== undefined) updateData.image     = image;

    // ── Business ──────────────────────────────────────────────────
    if (businessName  !== undefined) updateData.businessName  = businessName;
    if (gstin         !== undefined) updateData.gstin         = gstin;
    if (pan           !== undefined) updateData.pan           = pan;
    if (address       !== undefined) updateData.address       = address;
    if (city          !== undefined) updateData.city          = city;
    if (state         !== undefined) updateData.state         = state;
    if (pincode       !== undefined) updateData.pincode       = pincode;
    if (logoUrl       !== undefined) updateData.logoUrl       = logoUrl;
    if (signature     !== undefined) updateData.signature     = signature;
    if (currency      !== undefined) updateData.currency      = currency;
    if (invoicePrefix !== undefined) updateData.invoicePrefix = invoicePrefix;

    // ── Payment details ───────────────────────────────────────────
    if (upiId       !== undefined) updateData.upiId       = upiId;
    if (bankName    !== undefined) updateData.bankName    = bankName;
    if (bankAccount !== undefined) updateData.bankAccount = bankAccount;
    if (bankIfsc    !== undefined) updateData.bankIfsc    = bankIfsc;
    if (bankBranch  !== undefined) updateData.bankBranch  = bankBranch;

    // ── Notifications ─────────────────────────────────────────────
    if (notifyEmail    !== undefined) updateData.notifyEmail    = notifyEmail;
    if (notifyWhatsapp !== undefined) updateData.notifyWhatsapp = notifyWhatsapp;

    // ── Password change ───────────────────────────────────────────
    if (newPassword) {
      if (!currentPassword)
        return NextResponse.json(
          { error: "Current password is required" },
          { status: 400 }
        );

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true },
      });

      if (!user?.password)
        return NextResponse.json(
          { error: "OAuth account — password change not allowed" },
          { status: 400 }
        );

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch)
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );

      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    // ── Email change ──────────────────────────────────────────────
    if (newEmail) {
      const existing = await prisma.user.findUnique({
        where: { email: newEmail },
      });
      if (existing)
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        );

      const token  = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

      updateData.pendingEmail      = newEmail;
      updateData.emailChangeToken  = token;
      updateData.emailChangeExpiry = expiry;

      // await sendEmail({ to: newEmail, token }) // apni email utility
    }

    // ── Single DB call ────────────────────────────────────────────
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true, name: true, email: true,
        phone: true, image: true, plan: true,
        businessName: true, logoUrl: true,
        notifyEmail: true, notifyWhatsapp: true,
        pendingEmail: true,
      },
    });

    return NextResponse.json({
      ...updated,
      message: newEmail
        ? "Verification email sent to new address"
        : "Profile updated successfully",
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { password } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Password-based accounts ke liye verify karo
    if (user.password) {
      if (!password)
        return NextResponse.json(
          { error: "Password required to delete account" },
          { status: 400 }
        );

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return NextResponse.json(
          { error: "Incorrect password" },
          { status: 400 }
        );
    }

    // Cascade se Client, Invoice, Expense, Item sab delete ho jayenge
    await prisma.user.delete({ where: { id: session.user.id } });

    const response = NextResponse.json({
      message: "Account deleted successfully",
    });

    // Session cookies clear karo
    response.cookies.set("next-auth.session-token", "", { maxAge: 0 });
    response.cookies.set(
      "__Secure-next-auth.session-token", "", { maxAge: 0 }
    );

    return response;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
