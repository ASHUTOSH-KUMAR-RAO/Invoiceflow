import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { groq, AI_MODEL } from "@/lib/ai/client";
import { getItemSuggestionsPrompt } from "@/lib/ai/prompts";

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

    // Fetch user's past items from saved items + invoice items
    const [savedItems, invoiceItems] = await Promise.all([
      prisma.item.findMany({
        where: { userId },
        select: {
          name: true,
          rate: true,
          unit: true,
          taxRate: true,
          hsnCode: true,
        },
        take: 20,
      }),
      prisma.invoiceItem.findMany({
        where: { invoice: { userId } },
        select: {
          name: true,
          rate: true,
          unit: true,
          taxRate: true,
          hsnCode: true,
        },
        distinct: ["name"],
        take: 20,
      }),
    ]);

    // Merge and deduplicate
    const allItems = [
      ...savedItems,
      ...invoiceItems.filter(
        (ii) => !savedItems.some((si) => si.name === ii.name),
      ),
    ];

  const prompt = getItemSuggestionsPrompt({
    query,
    pastItems: allItems.map((item) => ({
      ...item,
      hsnCode: item.hsnCode ?? undefined,
    })),
  });

    const completion = await groq.chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.3,
    });

    const raw = completion.choices[0]?.message?.content?.trim();

    if (!raw) {
      return NextResponse.json(
        { error: "AI failed to respond" },
        { status: 500 },
      );
    }

    // Parse JSON safely
    const suggestions = JSON.parse(raw);

    return NextResponse.json({ suggestions }, { status: 200 });
  } catch (error) {
    console.error("AI suggestions error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
