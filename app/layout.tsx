import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import "./prosemirror.css"
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { RegisterSW } from "@/components/pwa/register-sw-component";
import { Toaster } from "react-hot-toast";
import { MobileNavbar } from "@/components/mobile-navbar";
import { Analytics } from '@vercel/analytics/react';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Pejuangkorea Academy",
  description: "Learn Korean language and culture",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pejuangkorea Academy",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/images/circle-logo.png"
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="Pejuangkorea Academy" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Pejuangkorea Academy" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script src="https://cdn.jsdelivr.net/npm/ios-pwa-splash@1.0.0/cdn.min.js"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            iosPWASplash('/images/circle-logo.png', '#000000');
          `
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster position="top-center" />
            <RegisterSW />
            {children}
            <MobileNavbar />
            <InstallPrompt />
            <Analytics />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
