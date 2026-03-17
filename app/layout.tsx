import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import { PwaRegister } from '@/components/pwa-register';
import './globals.css';

export const metadata: Metadata = {
  title: 'Minecraft Progression Companion',
  description:
    'A production-grade Minecraft survival companion with synced progression, achievements, and premium dashboard UX.',
  applicationName: 'Minecraft Progression Companion',
};

export const viewport: Viewport = {
  themeColor: '#020617',
  colorScheme: 'dark',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" data-theme="OVERWORLD">
      <body>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
