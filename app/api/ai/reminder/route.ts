import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { groq, AI_MODEL } from "@/lib/ai/client";
import { getReminderPrompt } from "@/lib/ai/prompts";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { clientName, invoiceNumber, amount, dueDate, daysOverdue, tone } =
      body;

    if (
      !clientName ||
      !invoiceNumber ||
      !amount ||
      !dueDate ||
      !daysOverdue ||
      !tone
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const prompt = getReminderPrompt({
      clientName,
      invoiceNumber,
      amount,
      dueDate,
      daysOverdue,
      tone,
    });

    const completion = await groq.chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    });

    const message = completion.choices[0]?.message?.content?.trim();

    if (!message) {
      return NextResponse.json(
        { error: "AI failed to generate message" },
        { status: 500 },
      );
    }

    return NextResponse.json({ message }, { status: 200 });
  } catch (error) {
    console.error("AI reminder error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
