import React from 'react';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import '../styles/tailwind.css';
import { Toaster } from 'sonner';
import { AppProviders } from '@/components/providers/AppProviders';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Carschek — Nigeria\'s Trusted Vehicle Inspection Platform',
  description: 'Carschek helps Nigerians buy and sell vehicles with confidence through professional inspections, verified listings, and transparent deal management.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    apple: [{ url: '/favicon.png', type: 'image/png' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen bg-[#F4F6F8] dark:bg-slate-950 antialiased text-[#1F2937] dark:text-slate-100"
        suppressHydrationWarning
      >
        <AppProviders>
          {children}
          <Toaster position="bottom-right" richColors />
        </AppProviders>

        {/* Load after hydration so third-party injectors cannot mismatch SSR HTML */}
        <Script
          src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fcarschekr4464back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.18"
          strategy="lazyOnload"
        />
        <Script src="https://static.rocket.new/rocket-shot.js?v=0.0.2" strategy="lazyOnload" />
      </body>
    </html>
  );
}
