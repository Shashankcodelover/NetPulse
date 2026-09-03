import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://netpulse.shashankj.tech"),
  title: "NetPulse CRM — Autonomous Relationship Intelligence (Imagine Cup 2026)",
  description:
    "Turn your LinkedIn and WhatsApp networks into a prioritized, trackable pipeline with deterministic half-life decay, autonomous dossiers, and multi-channel outreach.",
  keywords: [
    "NetPulse",
    "personal CRM",
    "relationship management",
    "algorithmic decay",
    "Imagine Cup",
    "TypeScript",
    "Next.js",
    "autonomous dossiers",
    "LinkedIn",
    "WhatsApp CRM",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
