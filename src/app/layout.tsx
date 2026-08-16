import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ToastProvider } from "@/components/ui/toast";
import { LanguageProvider } from "@/context/language-context";
import { GoogleAnalyticsTracker } from "@/components/analytics/google-analytics";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const gaId = process.env.NEXT_PUBLIC_GA_ID || "G-2Z9KP07NG6";

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
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${gaId}');
          `}
        </Script>
      </head>
      <body className={`${inter.variable} font-sans min-h-screen flex flex-col bg-white text-slate-900`}>
        <LanguageProvider>
          <SessionProvider>
            <QueryProvider>
              <ToastProvider>
                <GoogleAnalyticsTracker />
                {children}
              </ToastProvider>
            </QueryProvider>
          </SessionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

