import type { Metadata } from 'next';
import { ReactNode } from 'react';
import AppSidebar from '@/components/layout/app-sidebar';
import { AutoFetchProvider } from '@/components/providers/auto-fetch-provider';
import { ProtectedRoute } from '@/components/providers/protected-route';

export const metadata: Metadata = {
  title: 'Concept-CashSales',
  description: 'Concept-CashSales Dashboard'
};

const DashboardLayout = ({ children }: { children: ReactNode }) => {
 
  return (
    <ProtectedRoute>
      <AutoFetchProvider 
        defaultEnabled={true} 
        autoTriggerOnLoad={true}
        fetchInterval={0} // Disable interval fetching by default
      >
        <AppSidebar>{children}</AppSidebar>
      </AutoFetchProvider>
    </ProtectedRoute>
  );
};

export default DashboardLayout;

