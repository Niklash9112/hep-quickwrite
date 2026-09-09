import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import ServiceWorkerRegister from "@/components/service-worker-register";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "HEP-QuickWrite | KI-gestützte Fachberichte",
  description: "Professionelle Fachberichte für Heilerziehungspflege und Erzieher - powered by KI. ICF-konform, schnell, datenschutzsicher.",
  keywords: ["Fachbericht", "Heilerziehungspflege", "Erzieher", "ICF", "KI", "Dokumentation"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HEP-QuickWrite",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="de" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased`}>
          <ServiceWorkerRegister />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
