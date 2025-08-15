import type { Metadata } from 'next';
import { ReactNode } from 'react';
import AppSidebar from '@/components/layout/app-sidebar';

export const metadata: Metadata = {
  title: 'Concept-CashSales',
  description: 'Concept-CashSales Dashboard'
};

const DashboardLayout = ({ children }: { children: ReactNode }) => {
 
  return (
    <>
      <AppSidebar>{children}</AppSidebar>
  
    </>
  );
};

export default DashboardLayout;

