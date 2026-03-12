import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { AppHeader } from '@/components/header';
import { AppFooter } from '@/components/footer';
import { Toaster } from "@/components/ui/index"
import { AuthProvider } from '@/hooks/use-auth';

export const metadata: Metadata = {
  title: 'Makikibahay',
  description: 'Discover and book boarding houses in Cabanatuan City, Philippines.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <AppHeader />
          <main className="flex-grow">{children}</main>
          <AppFooter />
          <Toaster />
        </AuthProvider>
        <Script
          defer
          src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || "https://analytics.umami.is/script.js"}
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
