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
  metadataBase: new URL("http://shashankj.tech"),
  title: "NetPulse — Never let a good connection go cold",
  description:
    "Turn your LinkedIn and WhatsApp connections into a prioritized, trackable pipeline. Like a CRM, but for your personal network.",
  keywords: ["networking", "LinkedIn", "CRM", "contacts", "relationship management"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
