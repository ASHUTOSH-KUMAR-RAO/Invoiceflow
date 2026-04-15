import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PATCH - expense update karo
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const expense = await prisma.expense.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense nahi mila" }, { status: 404 });
    }

    const body = await req.json();
    const { title, amount, category, date, description, isDeductible } = body;

    const updated = await prisma.expense.update({
      where: { id: params.id },
      data: {
        title,
        amount: parseFloat(amount),
        category,
        date: date ? new Date(date) : undefined,
        description,
        isDeductible,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE - expense delete karo
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const expense = await prisma.expense.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense nahi mila" }, { status: 404 });
    }

    await prisma.expense.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Expense delete ho gaya" });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
