
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

    const userId = session.user.id;

    // Invoices fetch karo
    const invoices = await prisma.invoice.findMany({
      where: {
        userId,
        issueDate: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`),
        },
      },
      include: { client: true, payments: true },
    });

    // Expenses fetch karo
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`),
        },
      },
    });

    // Monthly revenue calculate karo
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthInvoices = invoices.filter((inv) => {
        return new Date(inv.issueDate).getMonth() + 1 === month;
      });
      const monthExpenses = expenses.filter((exp) => {
        return new Date(exp.date).getMonth() + 1 === month;
      });

      return {
        month: i,
        revenue: monthInvoices.reduce((sum, inv) => sum + inv.total, 0),
        paid: monthInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0),
        expenses: monthExpenses.reduce((sum, exp) => sum + exp.amount, 0),
      };
    });

    // Category wise expenses
    const expenseByCategory = expenses.reduce((acc: any, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    // Top clients
    const clientRevenue: any = {};
    invoices.forEach((inv) => {
      const name = inv.client.name;
      clientRevenue[name] = (clientRevenue[name] || 0) + inv.amountPaid;
    });
    const topClients = Object.entries(clientRevenue)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5);

    // Summary
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const totalPending = invoices.reduce((sum, inv) => sum + inv.amountDue, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalGst = invoices.reduce((sum, inv) => sum + inv.totalTax, 0);
    const deductibleExpenses = expenses
      .filter((exp) => exp.isDeductible)
      .reduce((sum, exp) => sum + exp.amount, 0);
    const netProfit = totalPaid - totalExpenses;

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalPaid,
        totalPending,
        totalExpenses,
        totalGst,
        deductibleExpenses,
        netProfit,
      },
      monthlyData,
      expenseByCategory,
      topClients,
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
