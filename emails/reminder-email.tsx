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

interface ReminderEmailProps {
  clientName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  message: string; // AI-generated message
}

export function ReminderEmail({
  clientName,
  invoiceNumber,
  amount,
  dueDate,
  message,
}: ReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Payment Reminder — Invoice {invoiceNumber} · ₹{amount.toLocaleString()}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section>
            <Text style={logo}>🧾 InvoiceFlow</Text>
          </Section>

          <Heading style={h1}>Payment Reminder</Heading>

          {/* AI-generated message */}
          <Section style={messageCard}>
            <Text style={messageText}>{message}</Text>
          </Section>

          {/* Invoice Details */}
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
                <Text style={overdueText}>{dueDate}</Text>
              </Column>
              <Column>
                <Text style={label}>Status</Text>
                <Text style={statusOverdue}>🔴 Overdue</Text>
              </Column>
            </Row>
          </Section>

          {/* CTA */}
          <Section style={btnSection}>
            <Button
              style={button}
              href={`https://invoiceflow.in/pay/${invoiceNumber}`}
            >
              Pay Now
            </Button>
          </Section>

          <Text style={smallText}>
            If you have already made the payment, please ignore this reminder.
            For any queries, reply to this email.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Sent via InvoiceFlow · Made for Indian freelancers
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
  margin: "0 0 20px",
};

const messageCard = {
  backgroundColor: "#111a14",
  borderLeft: "3px solid #22c55e",
  borderRadius: "8px",
  padding: "20px",
  margin: "0 0 20px",
};

const messageText = {
  color: "#d4d4d8",
  fontSize: "15px",
  lineHeight: "1.7",
  margin: "0",
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

const overdueText = {
  color: "#f87171",
  fontSize: "15px",
  fontWeight: "600",
  margin: "0 0 16px",
};

const statusOverdue = {
  color: "#f87171",
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
