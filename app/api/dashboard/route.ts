
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const now = new Date();

    // ==========================================
    // STATS
    // ==========================================
    const [allInvoices, totalClients] = await Promise.all([
      prisma.invoice.findMany({
        where: { userId },
        select: { status: true, total: true, amountPaid: true, amountDue: true },
      }),
      prisma.client.count({ where: { userId } }),
    ]);

    const totalRevenue = allInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPaid = allInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const totalPending = allInvoices.reduce((sum, inv) => sum + inv.amountDue, 0);

    // Invoice status counts
    const statusCounts = {
      PAID: 0, SENT: 0, OVERDUE: 0, DRAFT: 0, PARTIAL: 0,
    };
    allInvoices.forEach((inv) => {
      if (statusCounts[inv.status as keyof typeof statusCounts] !== undefined) {
        statusCounts[inv.status as keyof typeof statusCounts]++;
      }
    });

    // ==========================================
    // THIS MONTH
    // ==========================================
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const [thisMonthInvoices, lastMonthInvoices] = await Promise.all([
      prisma.invoice.findMany({
        where: { userId, createdAt: { gte: thisMonthStart, lte: thisMonthEnd } },
        select: { total: true },
      }),
      prisma.invoice.findMany({
        where: { userId, createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
        select: { total: true },
      }),
    ]);

    const thisMonthTotal = thisMonthInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const lastMonthTotal = lastMonthInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const monthChange = lastMonthTotal === 0 ? 100
      : Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100);

    // ==========================================
    // LAST 7 MONTHS CHART DATA
    // ==========================================
    const earningsData = await Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const date = subMonths(now, 6 - i);
        const start = startOfMonth(date);
        const end = endOfMonth(date);
        return prisma.invoice.findMany({
          where: { userId, createdAt: { gte: start, lte: end } },
          select: { total: true, amountPaid: true },
        }).then((invoices) => ({
          month: format(date, "MMM"),
          revenue: Math.round(invoices.reduce((sum, inv) => sum + inv.total, 0)),
          paid: Math.round(invoices.reduce((sum, inv) => sum + inv.amountPaid, 0)),
        }));
      })
    );

    // ==========================================
    // RECENT INVOICES (last 5)
    // ==========================================
    const recentInvoices = await prisma.invoice.findMany({
      where: { userId },
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalPaid,
        totalPending,
        totalClients,
        statusCounts,
        thisMonth: {
          total: thisMonthTotal,
          change: monthChange,
        },
      },
      earningsData,
      recentInvoices: recentInvoices.map((inv) => ({
        id: inv.invoiceNumber,
        realId: inv.id,
        client: inv.client.name,
        amount: inv.total,
        status: inv.status,
        date: inv.createdAt,
      })),
    }, { status: 200 });

  } catch (error) {
    console.error("GET dashboard error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
