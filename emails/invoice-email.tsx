import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";

interface InvoiceEmailProps {
  clientName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  invoiceUrl: string;
}

export function InvoiceEmail({
  clientName,
  invoiceNumber,
  amount,
  dueDate,
  invoiceUrl,
}: InvoiceEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Invoice {invoiceNumber} — ₹{amount.toLocaleString()} due on {dueDate}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section>
            <Text style={logo}>🧾 InvoiceFlow</Text>
          </Section>

          <Heading style={h1}>Hi {clientName},</Heading>

          <Text style={text}>
            Please find your invoice attached below. Kindly review the details
            and make the payment before the due date.
          </Text>

          {/* Invoice Details Card */}
          <Section style={card}>
            <Row>
              <Column>
                <Text style={label}>Invoice Number</Text>
                <Text style={value}>{invoiceNumber}</Text>
              </Column>
              <Column>
                <Text style={label}>Amount Due</Text>
                <Text style={amountText}>₹{amount.toLocaleString()}</Text>
              </Column>
            </Row>
            <Hr style={cardDivider} />
            <Row>
              <Column>
                <Text style={label}>Due Date</Text>
                <Text style={value}>{dueDate}</Text>
              </Column>
              <Column>
                <Text style={label}>Status</Text>
                <Text style={statusPending}>⏳ Pending</Text>
              </Column>
            </Row>
          </Section>

          {/* CTA Button */}
          <Section style={btnSection}>
            <Button style={button} href={invoiceUrl}>
              View & Pay Invoice
            </Button>
          </Section>

          <Text style={smallText}>
            You can also pay instantly via UPI — the QR code is included in your
            invoice.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            This invoice was sent via InvoiceFlow · Made for Indian freelancers
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// ==========================================
// STYLES
// ==========================================
const main = {
  backgroundColor: "#0a0f0d",
  fontFamily: "'Inter', Arial, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
};

const logo = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#22c55e",
  margin: "0 0 24px",
};

const h1 = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0 0 16px",
};

const text = {
  color: "#a1a1aa",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 20px",
};

const card = {
  backgroundColor: "#111a14",
  borderRadius: "12px",
  padding: "24px",
  margin: "20px 0",
  border: "1px solid #1f2a22",
};

const label = {
  color: "#71717a",
  fontSize: "12px",
  margin: "0 0 4px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

const value = {
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600",
  margin: "0 0 16px",
};

const amountText = {
  color: "#22c55e",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 0 16px",
};

const statusPending = {
  color: "#c9a84c",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 16px",
};

const cardDivider = {
  borderColor: "#1f2a22",
  margin: "8px 0 16px",
};

const btnSection = {
  textAlign: "center" as const,
  margin: "28px 0 16px",
};

const button = {
  backgroundColor: "#22c55e",
  borderRadius: "8px",
  color: "#000000",
  fontSize: "15px",
  fontWeight: "600",
  padding: "12px 28px",
  textDecoration: "none",
};

const smallText = {
  color: "#71717a",
  fontSize: "13px",
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const hr = {
  borderColor: "#1f2a22",
  margin: "24px 0 16px",
};

const footer = {
  color: "#52525b",
  fontSize: "13px",
  textAlign: "center" as const,
};
