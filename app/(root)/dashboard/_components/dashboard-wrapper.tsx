'use client';

import { useEffect, useState } from 'react';
import { useAutoFetch } from '@/components/providers/auto-fetch-provider';
import OverViewPage from './overview';
import {
  gettotaltrans,
  gettotalbranch,
  getCashsalesData,
  getPercentageChangeTotalTransaction
} from '@/actions/getdata';

interface DashboardData {
  totalTransactions: number;
  totalBranch: number;
  cashsalesData: any[];
  percentageChangeData: {
    totalTransactions: number;
    yesterdayTransactions: number;
    percentage: number;
    yesterdayDate: string;
  };
}

export default function DashboardWrapper() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { refreshTrigger } = useAutoFetch();

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching Dashboard Data...');
      
      const [totalTransactions, totalBranch, cashsalesData, percentageChangeData] =
        await Promise.all([
          gettotaltrans(),
          gettotalbranch(),
          getCashsalesData(),
          getPercentageChangeTotalTransaction()
        ]);

      setData({
        totalTransactions,
        totalBranch,
        cashsalesData,
        percentageChangeData
      });
      
      console.log('✅ Dashboard data updated successfully');
    } catch (error) {
      console.error('❌ Error fetching Dashboard Data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Refresh data when auto-fetch triggers a refresh
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('🔄 Auto-fetch triggered Dashboard refresh');
      fetchData();
    }
  }, [refreshTrigger]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Dashboard Data...</p>
        </div>
      </div>
    );
  }

  // Show a subtle refresh indicator when refreshing with existing data
  if (loading && data) {
    return (
      <div className="relative">
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border shadow-sm">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span className="text-xs text-muted-foreground">Refreshing...</span>
        </div>
        <OverViewPage
          totalTransactions={data.totalTransactions}
          totalBranch={data.totalBranch}
          cashsalesData={data.cashsalesData}
          percentageChangeData={data.percentageChangeData}
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to Load Dashboard Data</p>
        </div>
      </div>
    );
  }

  return (
    <OverViewPage
      totalTransactions={data.totalTransactions}
      totalBranch={data.totalBranch}
      cashsalesData={data.cashsalesData}
      percentageChangeData={data.percentageChangeData}
    />
  );
}
