import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Lato } from 'next/font/google';

export const metadata: Metadata = {
  title: "Concept-CashSale",
  description: "Concept-CashSale",
};

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap'
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
    lang="en"
    className={`${lato.className}`}
    suppressHydrationWarning={true}
  >
      <body className={'overflow-hidden'}>
        <ThemeProvider  
          attribute="class"
          defaultTheme="system"
          enableSystem
          // disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
