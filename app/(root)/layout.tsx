import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { ReactNode } from 'react';
import AppSidebar from '@/components/layout/app-sidebar';

export const metadata: Metadata = {
  title: 'Lending and Savings Apps',
  description: 'Lending and Savings Apps'
};

const DashboardLayout = ({ children }: { children: ReactNode }) => {
 
  return (
    <>
      <AppSidebar>{children}</AppSidebar>
      <Toaster />
    </>
  );
};

export default DashboardLayout;

