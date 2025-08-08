import { auth } from '@/auth';
import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import { Lato } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import ThemeProvider from '@/components/layout/ThemeToggle/theme-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Savings and Lending Apps',
  description: 'Dashboard for Savings and Lending Apps'
};

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap'
});

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${lato.className}`}
      suppressHydrationWarning={true}
    >
      <SessionProvider session={session}>
        <body className={'overflow-hidden'}>
          <NextTopLoader showSpinner={false} />
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster />
            <SpeedInsights />
            <Analytics />
          </ThemeProvider>
        </body>
      </SessionProvider>
    </html>
  );
};
export default RootLayout;
