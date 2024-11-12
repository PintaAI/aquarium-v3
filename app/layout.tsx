import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import "./prosemirror.css"
import Navbar from "../components/navbar";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { RegisterSW } from "@/components/pwa/register-sw-component";

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

export const metadata: Metadata = {
  title: "Pejuangkorea Academy",
  description: "Learn Korean language and culture",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pejuangkorea Academy",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: "/images/circle-logo.png",
    apple: "/images/circle-logo.png",
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
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/images/circle-logo.png" />
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
            <RegisterSW />
            <Navbar />
            {children}
            <InstallPrompt />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
