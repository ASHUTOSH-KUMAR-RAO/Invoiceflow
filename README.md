# InvoiceFlow 🧾

> India's smartest invoicing tool for freelancers — GST-ready, UPI-powered, WhatsApp-friendly, and now AI-powered.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css)
![Claude AI](https://img.shields.io/badge/Claude_AI-Anthropic-orange?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 🚀 What is InvoiceFlow?

InvoiceFlow is a **production-ready SaaS tool** built for Indian freelancers. Say goodbye to Excel — get a clean, fast, and professional invoicing experience with full GST support, UPI QR codes, WhatsApp sharing, and an AI assistant built right in.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🧾 GST-Ready Invoices | HSN/SAC codes, CGST/SGST/IGST auto-calculation |
| 📱 UPI QR Code | Auto-generated UPI QR on every invoice for instant payment |
| 💬 WhatsApp Share | 1-click invoice PDF sharing via WhatsApp |
| 🔁 Recurring Invoices | Auto-generate invoices for monthly retainer clients |
| ⏰ Late Payment Reminders | AI-written reminders sent via email/WhatsApp |
| 📊 Earnings Dashboard | Monthly graphs, top clients, and pending payments overview |
| 📄 Tax Summary Report | ITR-ready annual report generated in one click |
| 🎨 Custom Templates | 6+ designs with logo and brand color support |
| 🔗 Client Portal | Secure link for clients to view their invoices |
| 💰 Expense Tracker | Track expenses and view net profit |
| 🤖 AI Invoice Assistant | Ask questions about your revenue, clients, and invoices in plain English |
| ✍️ AI Reminder Writer | Auto-generate professional payment reminder messages |
| 💡 Smart Item Suggestions | AI suggests items, rates, and HSN codes based on past invoices |

---

## 🤖 AI Features (Powered by Claude)

InvoiceFlow uses **Anthropic's Claude AI** to make invoicing smarter, faster, and easier for Indian freelancers.

### 1. 💬 AI Invoice Assistant (Chatbot)

Ask questions about your business in plain English — no need to dig through reports manually.

**Example queries:**
- *"Rahul ka kitna payment pending hai?"*
- *"Is month ka total revenue kitna hai?"*
- *"Kaun sa client sabse zyada late pay karta hai?"*
- *"Last 3 months mein kitne invoices overdue hue?"*

The AI reads your real database and gives accurate, instant answers — like having a personal accountant available 24/7.

---

### 2. ✍️ AI Payment Reminder Writer

Client ne payment nahi kiya? Let AI write the perfect reminder — polite, professional, and personalized.

**How it works:**
- Select an overdue invoice
- Choose tone: **Polite** / **Firm** / **Final Notice**
- AI generates a ready-to-send message for **Email** and **WhatsApp**
- Edit if needed, then send with one click

**Example output:**
> *"Hi Rahul bhai, hope you're doing well! Just a quick reminder that Invoice #INV-0042 of ₹24,500 was due on April 10th. Please let me know if you need any clarification. Looking forward to your payment. Thanks!"*

---

### 3. 💡 Smart Item Suggestions

Speed up invoice creation with AI-powered autocomplete.

**How it works:**
- Start typing an item name while creating an invoice
- AI suggests matching items from your invoice history
- Auto-fills rate, unit, HSN code, and tax rate
- Saves time — especially for recurring clients with similar services

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| Database | PostgreSQL (Neon) |
| ORM | Prisma 6 |
| Auth | NextAuth.js v5 |
| PDF | React PDF |
| Email | Resend + React Email |
| Payments | Razorpay |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| AI | Anthropic Claude API |
| Deployment | Vercel |

---

## 📁 Project Structure

```
invoiceflow/
├── app/
│   ├── (auth)/              # Login, Register pages
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── invoices/        # Invoice CRUD
│   │   ├── clients/         # Client management
│   │   ├── expenses/        # Expense tracking
│   │   ├── reports/         # Tax & earnings reports
│   │   └── settings/        # User settings
│   └── api/
│       ├── invoices/        # Invoice API routes
│       ├── clients/         # Client API routes
│       ├── dashboard/       # Dashboard stats API
│       └── ai/              # AI-powered API routes
│           ├── chat/        # AI Invoice Assistant chatbot
│           ├── reminder/    # AI payment reminder generator
│           └── suggestions/ # Smart item suggestions
├── components/
│   ├── ui/                  # shadcn components
│   └── ai/                  # AI-powered components
│       ├── AiChatbot.tsx    # Floating chat widget
│       ├── ReminderComposer.tsx  # AI reminder UI
│       └── ItemSuggestions.tsx   # Invoice item autocomplete
├── lib/
│   ├── auth.ts              # NextAuth config
│   ├── prisma.ts            # Prisma client
│   └── ai/                  # AI utilities
│       ├── prompts.ts       # All AI prompts (centralized)
│       └── client.ts        # Anthropic client setup
├── hooks/                   # Custom React hooks
├── store/                   # Zustand global state
├── types/                   # TypeScript interfaces
├── emails/                  # React Email templates
└── prisma/                  # Database schema & migrations
```

---

## ⚡ Getting Started

### Prerequisites

- Node.js v20+
- npm v10+
- Git
- Neon account (free) — [neon.tech](https://neon.tech)
- Anthropic API key — [console.anthropic.com](https://console.anthropic.com)

### 1. Clone the repository

```bash
git clone https://github.com/ASHUTOSH-KUMAR-RAO/Invoiceflow.git
cd invoiceflow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your values in `.env.local`:

```env
DATABASE_URL="your-neon-connection-string"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
RESEND_API_KEY="your-resend-api-key"
RAZORPAY_KEY_ID="your-razorpay-key"
RAZORPAY_KEY_SECRET="your-razorpay-secret"
ANTHROPIC_API_KEY="your-anthropic-api-key"
```

### 4. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🌿 Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production — stable releases only |
| `develop` | Active development |
| `feature/xyz` | New features |
| `fix/xyz` | Bug fixes |
| `hotfix/xyz` | Urgent production fixes |

---

## 💰 Pricing Plans

| Plan | Price | Invoices | AI Features |
|------|-------|----------|-------------|
| Free | ₹0/month | 3/month | ❌ |
| Pro | ₹199/month | Unlimited | ✅ |
| Agency | ₹499/month | Unlimited + Team | ✅ |

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.MD](./CONTRIBUTING.MD) first.

```bash
# Fork → Create a feature branch → Submit a PR
git checkout -b feature/amazing-feature
git commit -m "feat: add amazing feature"
git push origin feature/amazing-feature
```

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

## 👨‍💻 Author

Made with ❤️ by Ashutosh for Indian freelancers.

---

<p align="center">
  <strong>InvoiceFlow</strong> — Invoice professionally, every time. 🚀
</p>
