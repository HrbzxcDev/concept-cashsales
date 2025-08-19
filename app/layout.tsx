import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import { ReactNode } from 'react';
import ThemeProvider from '@/components/layout/ThemeToggle/theme-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Savings and Lending Apps',
  description: 'Dashboard for Savings and Lending Apps'
};

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], 
  style: 'normal',
  display: 'swap'
});

const RootLayout = async ({ children }: { children: ReactNode }) => {

  return (
    <html
      lang="en"
      className={`${montserrat.className}`}
      suppressHydrationWarning={true}
    >
        <body className={'overflow-hidden'}>
          <NextTopLoader showSpinner={false} />
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster />
         
        </ThemeProvider>
      </body>
    </html>
  );
};
export default RootLayout;
