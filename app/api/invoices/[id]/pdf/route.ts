import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import puppeteer from "puppeteer";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = await params;

    const invoice = await prisma.invoice.findFirst({
      where: { id, userId },
      include: {
        client: true,
        items: true,
        user: {
          select: {
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
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
      }).format(amount);

    const formatDate = (date: string | Date) =>
      new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #fff;
      color: #1a1a1a;
      font-size: 13px;
      padding: 40px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 2px solid #1a472a;
    }
    .business-name {
      font-size: 24px;
      font-weight: 700;
      color: #1a472a;
    }
    .business-info {
      color: #555;
      font-size: 12px;
      margin-top: 4px;
      line-height: 1.6;
    }
    .invoice-title {
      text-align: right;
    }
    .invoice-title h2 {
      font-size: 32px;
      font-weight: 800;
      color: #1a472a;
      letter-spacing: 2px;
    }
    .invoice-number {
      font-size: 14px;
      color: #555;
      margin-top: 4px;
    }
    .status-badge {
      display: inline-block;
      padding: 3px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      margin-top: 6px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .status-DRAFT { background: #f3f4f6; color: #6b7280; }
    .status-SENT { background: #dbeafe; color: #1d4ed8; }
    .status-PAID { background: #dcfce7; color: #15803d; }
    .status-PARTIAL { background: #fef9c3; color: #b45309; }
    .status-OVERDUE { background: #fee2e2; color: #b91c1c; }
    .status-CANCELLED { background: #f3f4f6; color: #6b7280; }

    .bill-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 28px;
      gap: 20px;
    }
    .bill-box {
      flex: 1;
      background: #f9fafb;
      border-radius: 10px;
      padding: 16px;
    }
    .bill-box h4 {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #9ca3af;
      margin-bottom: 8px;
    }
    .bill-box .name {
      font-weight: 700;
      font-size: 14px;
      color: #111;
    }
    .bill-box p {
      color: #555;
      font-size: 12px;
      line-height: 1.6;
      margin-top: 2px;
    }
    .dates-box {
      min-width: 200px;
      background: #f9fafb;
      border-radius: 10px;
      padding: 16px;
    }
    .dates-box h4 {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #9ca3af;
      margin-bottom: 8px;
    }
    .date-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    .date-row span:first-child { color: #9ca3af; font-size: 12px; }
    .date-row span:last-child { color: #111; font-size: 12px; font-weight: 500; }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    thead tr {
      background: #1a472a;
      color: white;
    }
    thead th {
      padding: 10px 12px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    thead th:last-child { text-align: right; }
    thead th:nth-child(2),
    thead th:nth-child(3),
    thead th:nth-child(4) { text-align: right; }
    tbody tr { border-bottom: 1px solid #f0f0f0; }
    tbody tr:nth-child(even) { background: #fafafa; }
    tbody td { padding: 10px 12px; vertical-align: top; }
    tbody td:nth-child(2),
    tbody td:nth-child(3),
    tbody td:nth-child(4) { text-align: right; color: #555; }
    tbody td:last-child { text-align: right; font-weight: 600; }
    .item-name { font-weight: 600; color: #111; }
    .item-desc { font-size: 11px; color: #9ca3af; margin-top: 2px; }
    .item-hsn { font-size: 10px; color: #bbb; font-family: monospace; }

    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 28px;
    }
    .totals-box {
      min-width: 260px;
      background: #f9fafb;
      border-radius: 10px;
      padding: 16px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
    }
    .total-row span:first-child { color: #6b7280; }
    .total-row span:last-child { color: #111; font-weight: 500; }
    .total-row.discount span:last-child { color: #ef4444; }
    .total-row.grand {
      border-top: 2px solid #1a472a;
      padding-top: 10px;
      margin-top: 6px;
      font-size: 15px;
    }
    .total-row.grand span:first-child { color: #111; font-weight: 700; }
    .total-row.grand span:last-child { color: #1a472a; font-weight: 800; }
    .total-row.due span:last-child { color: #d97706; font-weight: 700; }

    .notes-section {
      display: flex;
      gap: 20px;
      margin-bottom: 28px;
    }
    .note-box {
      flex: 1;
      background: #f9fafb;
      border-radius: 10px;
      padding: 14px;
    }
    .note-box h4 {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #9ca3af;
      margin-bottom: 6px;
    }
    .note-box p { color: #555; font-size: 12px; line-height: 1.6; }

    .footer {
      text-align: center;
      color: #9ca3af;
      font-size: 11px;
      border-top: 1px solid #f0f0f0;
      padding-top: 16px;
    }
    .footer span { color: #1a472a; font-weight: 600; }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div>
      <div class="business-name">${invoice.user.businessName || invoice.user.name || "Business"}</div>
      <div class="business-info">
        ${invoice.user.email ? `${invoice.user.email}<br/>` : ""}
        ${invoice.user.phone ? `${invoice.user.phone}<br/>` : ""}
        ${invoice.user.gstin ? `GSTIN: ${invoice.user.gstin}<br/>` : ""}
        ${invoice.user.pan ? `PAN: ${invoice.user.pan}<br/>` : ""}
        ${[invoice.user.address, invoice.user.city, invoice.user.state].filter(Boolean).join(", ")}
      </div>
    </div>
    <div class="invoice-title">
      <h2>INVOICE</h2>
      <div class="invoice-number">${invoice.invoiceNumber}</div>
      <div>
        <span class="status-badge status-${invoice.status}">${invoice.status}</span>
      </div>
    </div>
  </div>

  <!-- Bill To + Dates -->
  <div class="bill-section">
    <div class="bill-box">
      <h4>Bill To</h4>
      <div class="name">${invoice.client.name}</div>
      ${invoice.client.email ? `<p>${invoice.client.email}</p>` : ""}
      ${invoice.client.phone ? `<p>${invoice.client.phone}</p>` : ""}
      ${invoice.client.gstin ? `<p>GSTIN: ${invoice.client.gstin}</p>` : ""}
      ${invoice.client.pan ? `<p>PAN: ${invoice.client.pan}</p>` : ""}
      ${
        [
          invoice.client.address,
          invoice.client.city,
          invoice.client.state,
        ].filter(Boolean).length > 0
          ? `<p>${[invoice.client.address, invoice.client.city, invoice.client.state].filter(Boolean).join(", ")}</p>`
          : ""
      }
    </div>
    <div class="dates-box">
      <h4>Invoice Details</h4>
      <div class="date-row">
        <span>Invoice No</span>
        <span>${invoice.invoiceNumber}</span>
      </div>
      <div class="date-row">
        <span>Issue Date</span>
        <span>${formatDate(invoice.issueDate)}</span>
      </div>
      <div class="date-row">
        <span>Due Date</span>
        <span>${formatDate(invoice.dueDate)}</span>
      </div>
      ${
        invoice.paidAt
          ? `
      <div class="date-row">
        <span>Paid On</span>
        <span style="color:#15803d">${formatDate(invoice.paidAt)}</span>
      </div>`
          : ""
      }
    </div>
  </div>

  <!-- Items Table -->
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Qty</th>
        <th>Rate</th>
        <th>GST</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.items
        .map(
          (item) => `
      <tr>
        <td>
          <div class="item-name">${item.name}</div>
          ${item.description ? `<div class="item-desc">${item.description}</div>` : ""}
          ${item.hsnCode ? `<div class="item-hsn">HSN: ${item.hsnCode}</div>` : ""}
        </td>
        <td>${item.quantity} ${item.unit}</td>
        <td>${formatCurrency(item.rate)}</td>
        <td>${item.taxRate}%</td>
        <td>${formatCurrency(item.amount)}</td>
      </tr>`,
        )
        .join("")}
    </tbody>
  </table>

  <!-- Totals -->
  <div class="totals-section">
    <div class="totals-box">
      <div class="total-row">
        <span>Subtotal</span>
        <span>${formatCurrency(invoice.subtotal)}</span>
      </div>
      ${
        invoice.discountAmount > 0
          ? `
      <div class="total-row discount">
        <span>Discount ${invoice.discountType === "PERCENTAGE" ? `(${invoice.discountValue}%)` : ""}</span>
        <span>− ${formatCurrency(invoice.discountAmount)}</span>
      </div>`
          : ""
      }
      ${
        invoice.isGst && invoice.totalTax > 0
          ? `
        ${
          invoice.gstType === "CGST_SGST"
            ? `
        <div class="total-row">
          <span>CGST</span>
          <span>${formatCurrency(invoice.cgst)}</span>
        </div>
        <div class="total-row">
          <span>SGST</span>
          <span>${formatCurrency(invoice.sgst)}</span>
        </div>`
            : `
        <div class="total-row">
          <span>IGST</span>
          <span>${formatCurrency(invoice.igst)}</span>
        </div>`
        }
      `
          : ""
      }
      <div class="total-row grand">
        <span>Total</span>
        <span>${formatCurrency(invoice.total)}</span>
      </div>
      ${
        invoice.amountPaid > 0
          ? `
      <div class="total-row">
        <span>Amount Paid</span>
        <span style="color:#15803d">${formatCurrency(invoice.amountPaid)}</span>
      </div>`
          : ""
      }
      ${
        invoice.amountDue > 0
          ? `
      <div class="total-row due">
        <span>Amount Due</span>
        <span>${formatCurrency(invoice.amountDue)}</span>
      </div>`
          : ""
      }
    </div>
  </div>

  <!-- Notes + Terms -->
  ${
    invoice.notes || invoice.terms
      ? `
  <div class="notes-section">
    ${
      invoice.notes
        ? `
    <div class="note-box">
      <h4>Notes</h4>
      <p>${invoice.notes}</p>
    </div>`
        : ""
    }
    ${
      invoice.terms
        ? `
    <div class="note-box">
      <h4>Terms & Conditions</h4>
      <p>${invoice.terms}</p>
    </div>`
        : ""
    }
  </div>`
      : ""
  }

  <!-- Footer -->
  <div class="footer">
    Generated by <span>InvoiceFlow</span> • Thank you for your business!
  </div>

</body>
</html>`;

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
