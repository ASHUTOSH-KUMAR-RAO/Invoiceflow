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
} from "@react-email/components";

interface WelcomeEmailProps {
  name: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Welcome to InvoiceFlow — India's smartest invoicing tool!
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Text style={logo}>🧾 InvoiceFlow</Text>
          </Section>

          <Heading style={h1}>Welcome, {name}! 👋</Heading>

          <Text style={text}>
            We're thrilled to have you on board. InvoiceFlow is built
            specifically for Indian freelancers — GST-ready, UPI-powered, and
            now AI-assisted.
          </Text>

          <Text style={text}>Here's what you can do right away:</Text>

          <Section style={featureList}>
            <Text style={feature}>🧾 Create GST-ready invoices in seconds</Text>
            <Text style={feature}>
              📱 Generate UPI QR codes for instant payment
            </Text>
            <Text style={feature}>
              💬 Share invoices via WhatsApp in one click
            </Text>
            <Text style={feature}>🤖 Use AI to write payment reminders</Text>
          </Section>

          <Section style={btnSection}>
            <Button style={button} href="https://invoiceflow.in/dashboard">
              Go to Dashboard
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Made with ❤️ for Indian freelancers · InvoiceFlow
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

const logoSection = {
  marginBottom: "24px",
};

const logo = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#22c55e",
  margin: "0",
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
  margin: "0 0 12px",
};

const featureList = {
  backgroundColor: "#111a14",
  borderRadius: "12px",
  padding: "20px",
  margin: "20px 0",
};

const feature = {
  color: "#d4d4d8",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 8px",
};

const btnSection = {
  textAlign: "center" as const,
  margin: "28px 0",
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

const hr = {
  borderColor: "#1f2a22",
  margin: "28px 0 16px",
};

const footer = {
  color: "#52525b",
  fontSize: "13px",
  textAlign: "center" as const,
};
