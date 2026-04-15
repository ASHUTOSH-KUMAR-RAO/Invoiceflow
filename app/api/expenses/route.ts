import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - sabhi expenses fetch karo
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const where: any = { userId: session.user.id };

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      where.date = { gte: startDate, lte: endDate };
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    return NextResponse.json({ expenses, total });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST - naya expense add karo
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, amount, category, date, description, isDeductible } = body;

    if (!title || !amount) {
      return NextResponse.json(
        { error: "Title aur amount required hai" },
        { status: 400 },
      );
    }

    const expense = await prisma.expense.create({
      data: {
        userId: session.user.id,
        title,
        amount: parseFloat(amount),
        category: category || "OTHER",
        date: date ? new Date(date) : new Date(),
        description,
        isDeductible: isDeductible || false,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
