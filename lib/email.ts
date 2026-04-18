import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "InvoiceFlow <noreply@yourdomain.com>";

// ==========================================
// WELCOME EMAIL
// ==========================================
export async function sendWelcomeEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}) {
  const { WelcomeEmail } = await import("@/emails/welcome-email");
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Welcome to InvoiceFlow! 🧾",
    react: WelcomeEmail({ name }),
  });
}

// ==========================================
// INVOICE EMAIL
// ==========================================
export async function sendInvoiceEmail({
  to,
  clientName,
  invoiceNumber,
  amount,
  dueDate,
  invoiceUrl,
}: {
  to: string;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  invoiceUrl: string;
}) {
  const { InvoiceEmail } = await import("@/emails/invoice-email");
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Invoice ${invoiceNumber} from InvoiceFlow`,
    react: InvoiceEmail({
      clientName,
      invoiceNumber,
      amount,
      dueDate,
      invoiceUrl,
    }),
  });
}

// ==========================================
// REMINDER EMAIL
// ==========================================
export async function sendReminderEmail({
  to,
  clientName,
  invoiceNumber,
  amount,
  dueDate,
  message,
}: {
  to: string;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  message: string;
}) {
  const { ReminderEmail } = await import("@/emails/reminder-email");
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Payment Reminder — Invoice ${invoiceNumber}`,
    react: ReminderEmail({
      clientName,
      invoiceNumber,
      amount,
      dueDate,
      message,
    }),
  });
}
