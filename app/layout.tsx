import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "InvoiceFlow — India's Smartest Invoice Tool",
    template: "%s | InvoiceFlow",
  },
  description:
    "GST-ready invoices, UPI QR codes, aur WhatsApp sharing — sab kuch ek hi jagah. India ke freelancers ke liye banaya gaya.",
  keywords: ["invoice", "GST", "freelancer", "India", "UPI", "billing"],
  authors: [{ name: "InvoiceFlow" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "InvoiceFlow — India's Smartest Invoice Tool",
    description: "GST-ready invoices, UPI QR codes, aur WhatsApp sharing.",
    siteName: "InvoiceFlow",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${syne.variable} ${dmSans.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
