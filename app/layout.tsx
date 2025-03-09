import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/provider/theme-provider";
import { SessionProvider } from "next-auth/react";
import { MobileNavbar } from "@/components/ui/mobile-navbar";

const atma = localFont({
  src: [
    {
      path: '../public/fonts/Atma/Atma-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/Atma/Atma-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Atma/Atma-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Atma/Atma-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/Atma/Atma-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: "--font-atma",
});

const jua = localFont({
  src: '../public/fonts/Jua/Jua-Regular.ttf',
  variable: "--font-jua",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#095443',
}

export const metadata: Metadata = {
  title: "Pejuangkorea",
  description: "Korean Language Learning Platform",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "Pejuangkorea",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body
        className={`${atma.variable} ${jua.variable} antialiased`}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
           <MobileNavbar />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
