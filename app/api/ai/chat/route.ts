import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { groq, AI_MODEL } from "@/lib/ai/client";
import { getChatPrompt } from "@/lib/ai/prompts";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Fetch real dashboard data for context
    const [invoices, totalClients] = await Promise.all([
      prisma.invoice.findMany({
        where: { userId },
        select: {
          total: true,
          amountPaid: true,
          amountDue: true,
          status: true,
        },
      }),
      prisma.client.count({ where: { userId } }),
    ]);

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthInvoices = await prisma.invoice.findMany({
      where: { userId, createdAt: { gte: thisMonthStart } },
      select: { total: true },
    });

    const dashboardContext = {
      totalRevenue: invoices.reduce((sum, inv) => sum + inv.total, 0),
      totalPaid: invoices.reduce((sum, inv) => sum + inv.amountPaid, 0),
      totalPending: invoices.reduce((sum, inv) => sum + inv.amountDue, 0),
      totalClients,
      overdueCount: invoices.filter((inv) => inv.status === "OVERDUE").length,
      thisMonthTotal: thisMonthInvoices.reduce(
        (sum, inv) => sum + inv.total,
        0,
      ),
    };

    const prompt = getChatPrompt({ userQuery: query, dashboardContext });

    const completion = await groq.chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.5,
    });

    const answer = completion.choices[0]?.message?.content?.trim();

    if (!answer) {
      return NextResponse.json(
        { error: "AI failed to respond" },
        { status: 500 },
      );
    }

    return NextResponse.json({ answer }, { status: 200 });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
