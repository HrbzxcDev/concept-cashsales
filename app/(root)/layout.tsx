import type { Metadata } from 'next';
import { ReactNode } from 'react';
import AppSidebar from '@/components/layout/app-sidebar';

export const metadata: Metadata = {
  title: 'Cash Sales',
  description: 'Cash Sales'
};
const DashboardLayout = async ({ children }: { children: ReactNode }) => {
  return (
    <>
      <AppSidebar>{children}</AppSidebar>
    </>
  );
};
export default DashboardLayout;

