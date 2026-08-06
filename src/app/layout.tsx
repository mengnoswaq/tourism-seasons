import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Tourism Seasons | Travel, Destinations & Seasonal Guides",
  description: "Explore the best travel destinations, seasonal guides, culture, and tourism news across all seasons.",
  keywords: ["tourism", "travel", "seasons", "vacation", "destinations", "guides"],
  authors: [{ name: "Tourism Seasons Team" }],
  openGraph: {
    title: "Tourism Seasons | Travel & Seasonal Destination Guides",
    description: "Explore top travel destinations, seasonal recommendations, and tourism insights.",
    siteName: "Tourism Seasons",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans min-h-screen flex flex-col bg-white text-slate-900`}>
        <SessionProvider>
          <QueryProvider>{children}</QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
