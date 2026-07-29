import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProviderWrapper from '@/components/providers/AuthProviderWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Urbanito - Sistema de Rastreo GPS',
  description: 'Sistema de rastreo en tiempo real para transporte urbano Buenavista - La Florida',
  manifest: '/manifest.json',
  themeColor: '#1890ff',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProviderWrapper>{children}</AuthProviderWrapper>
      </body>
    </html>
  );
}
