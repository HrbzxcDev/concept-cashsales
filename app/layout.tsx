import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import { ReactNode } from 'react';
import Providers from '@/components/layout/providers';
import { AuthProvider } from '@/components/providers/auth-provider';
import { auth } from '@/lib/nextauth';
import './globals.css';

export const metadata: Metadata = {
  title: 'Concept CashSales',
  description: 'Dashboard for Concept CashSales',
  icons: {
    icon: '/Logo.ico',
  },
};

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], 
  style: 'normal',
  display: 'swap'
});

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${montserrat.className}`}
      suppressHydrationWarning={true}
    >
        <body className={'overflow-hidden'}>
          <NextTopLoader showSpinner={false} />
          <Providers session={session}>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </Providers>
        </body>
    </html>
  );
};
export default RootLayout;
