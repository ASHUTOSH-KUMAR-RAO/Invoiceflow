
// ==========================================
// PAYMENT REMINDER PROMPT
// ==========================================
export function getReminderPrompt({
  clientName,
  invoiceNumber,
  amount,
  dueDate,
  daysOverdue,
  tone,
}: {
  clientName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  tone: "polite" | "firm" | "final";
}) {
  const toneGuide = {
    polite: "friendly and polite — like a gentle nudge from a professional",
    firm: "professional and firm — clearly request payment while remaining respectful",
    final: "serious and urgent — this is the last reminder, you may mention further action if payment is not received",
  };

  return `You are an AI assistant helping an Indian freelancer write payment reminder messages.

Client Name: ${clientName}
Invoice Number: ${invoiceNumber}
Amount Due: ₹${amount.toLocaleString()}
Due Date: ${dueDate}
Days Overdue: ${daysOverdue} days

Tone: ${toneGuide[tone]}

Write a short, professional payment reminder message that:
- Is written in clear English
- Is no longer than 3-4 sentences
- Mentions the invoice number and amount due
- Starts with "Hi ${clientName},"

Write only the message, nothing else.`;
}

// ==========================================
// AI CHATBOT PROMPT
// ==========================================
export function getChatPrompt({
  userQuery,
  dashboardContext,
}: {
  userQuery: string;
  dashboardContext: {
    totalRevenue: number;
    totalPaid: number;
    totalPending: number;
    totalClients: number;
    overdueCount: number;
    thisMonthTotal: number;
  };
}) {
  return `You are an AI assistant for InvoiceFlow, helping Indian freelancers manage their invoicing and payments.

User's business data:
- Total Revenue: ₹${dashboardContext.totalRevenue.toLocaleString()}
- Paid Amount: ₹${dashboardContext.totalPaid.toLocaleString()}
- Pending Amount: ₹${dashboardContext.totalPending.toLocaleString()}
- Total Clients: ${dashboardContext.totalClients}
- Overdue Invoices: ${dashboardContext.overdueCount}
- This Month Revenue: ₹${dashboardContext.thisMonthTotal.toLocaleString()}

User's question: ${userQuery}

Answer in clear, concise English in 2-3 sentences. Use the business data above to give accurate answers.
Write only the answer, nothing else.`;
}

// ==========================================
// ITEM SUGGESTIONS PROMPT
// ==========================================
export function getItemSuggestionsPrompt({
  query,
  pastItems,
}: {
  query: string;
  pastItems: { name: string; rate: number; unit: string; taxRate: number; hsnCode?: string }[];
}) {
  return `You are an invoicing assistant helping an Indian freelancer find the right items for their invoice.

User typed: "${query}"

Past invoice items:
${pastItems.map((item) => `- ${item.name} | Rate: ₹${item.rate} | Unit: ${item.unit} | Tax: ${item.taxRate}% | HSN: ${item.hsnCode ?? "N/A"}`).join("\n")}

Suggest the best matching items from the past items above, or suggest common Indian freelancer services if no match is found.

Respond ONLY in this exact JSON format, nothing else:
[
  {
    "name": "item name",
    "rate": 0,
    "unit": "nos",
    "taxRate": 18,
    "hsnCode": "998314"
  }
]

Maximum 3 suggestions.`;
}
