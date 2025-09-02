'use client';

import { useEffect, useState } from 'react';
import { useAutoFetch } from '@/components/providers/auto-fetch-provider';
import OverViewPage from './overview';
import {
  gettotaltrans,
  gettotalbranch,
  getCashsalesData,
  getCashsalesDetailsData,
  gettotalitemsquantity,
  getPercentageChangeTotalTransaction,
  getPercentageChangeTotalItemsQuantity,
  getTotalNetAmount,
  getTotalDiscount,
  getMonthlySalesAndDiscountData,
  getWeeklySalesAndDiscountData,
  getDailySalesAndDiscountData,
  getTop5ItemsByQuantity
} from '@/actions/getdata';

interface DashboardData {
  totalTransactions: number;
  totalBranch: number;
  totalItemsQuantity: number;
  totalNetAmount: number;
  totalDiscount: number;
  monthlySalesAndDiscountData: any[];
  weeklySalesAndDiscountData: any[];
  dailySalesAndDiscountData: any[];
  cashsalesData: any[];
  cashsalesDetailsData: any[];
  percentageChangeData: {
    totalTransactions: number;
    yesterdayTransactions: number;
    percentage: number;
    yesterdayDate: string;
  };
  percentageChangeDataItemsQuantity: {
    totalItemsQuantity: number;
    yesterdayItemsQuantity: number;
    percentage: number;
    yesterdayDate: string;
  };
  top5ItemsByQuantity: {
    stockcode: string;
    totalQuantity: number;
  }[];
}

export default function DashboardWrapper() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { refreshTrigger } = useAutoFetch();

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching Dashboard Data...');

      const [
        totalTransactions,
        totalBranch,
        totalItemsQuantity,
        totalNetAmount,
        totalDiscount,
        monthlySalesAndDiscountData,
        weeklySalesAndDiscountData,
        dailySalesAndDiscountData,
        cashsalesData,
        cashsalesDetailsData,
        percentageChangeData,
        percentageChangeDataItemsQuantity,
        top5ItemsByQuantity
      ] = await Promise.all([
        gettotaltrans(),
        gettotalbranch(),
        gettotalitemsquantity(),
        getTotalNetAmount(),
        getTotalDiscount(),
        getMonthlySalesAndDiscountData(),
        getWeeklySalesAndDiscountData(),
        getDailySalesAndDiscountData(),
        getCashsalesData(),
        getCashsalesDetailsData(),
        getPercentageChangeTotalTransaction(),
        getPercentageChangeTotalItemsQuantity(),
        getTop5ItemsByQuantity()
      ]);

      setData({
        totalTransactions,
        totalBranch,
        totalItemsQuantity: Number(totalItemsQuantity),
        totalNetAmount,
        totalDiscount,
        monthlySalesAndDiscountData,
        weeklySalesAndDiscountData,
        dailySalesAndDiscountData,
        cashsalesData,
        cashsalesDetailsData,
        percentageChangeData,
        percentageChangeDataItemsQuantity,
        top5ItemsByQuantity
      });

      // console.log('✅ Dashboard data updated successfully');
      // console.log(
      //   '📊 cashsalesDetailsData length:',
      //   cashsalesDetailsData?.length || 0
      // );
      // console.log(
      //   '📊 cashsalesDetailsData sample:',
      //   cashsalesDetailsData?.slice(0, 3)
      // );
      // console.log('📊 totalItemsQuantity:', totalItemsQuantity);
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading Dashboard Data...</p>
        </div>
      </div>
    );
  }

  // Show a subtle refresh indicator when refreshing with existing data
  if (loading && data) {
    return (
      <div className="relative">
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 shadow-sm backdrop-blur-sm">
          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary"></div>
          <span className="text-xs text-muted-foreground">Refreshing...</span>
        </div>
        <OverViewPage
          totalTransactions={data.totalTransactions}
          totalBranch={data.totalBranch}
          totalItemsQuantity={data.totalItemsQuantity}
          totalNetAmount={data.totalNetAmount}
          totalDiscount={data.totalDiscount}
          monthlySalesAndDiscountData={data.monthlySalesAndDiscountData}  
          weeklySalesAndDiscountData={data.weeklySalesAndDiscountData}
          dailySalesAndDiscountData={data.dailySalesAndDiscountData}
          cashsalesData={data.cashsalesData}
          cashsalesDetailsData={data.cashsalesDetailsData}
          percentageChangeData={data.percentageChangeData}
          percentageChangeDataItemsQuantity={
            data.percentageChangeDataItemsQuantity
          }
          top5ItemsByQuantity={data.top5ItemsByQuantity}
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center gap-2 flex flex-col">
          <p className="text-muted-foreground">Failed to Load Dashboard Data...</p>
          <p className="text-muted-foreground">Please Try Again Later.</p>
        </div>
      </div>
    );
  }

  return (
            <OverViewPage
          totalTransactions={data.totalTransactions}
          totalBranch={data.totalBranch}
          totalItemsQuantity={data.totalItemsQuantity}
          totalNetAmount={data.totalNetAmount}
          totalDiscount={data.totalDiscount}
          monthlySalesAndDiscountData={data.monthlySalesAndDiscountData}
          weeklySalesAndDiscountData={data.weeklySalesAndDiscountData}
          dailySalesAndDiscountData={data.dailySalesAndDiscountData}
          cashsalesData={data.cashsalesData}
          cashsalesDetailsData={data.cashsalesDetailsData}
          percentageChangeData={data.percentageChangeData}
          percentageChangeDataItemsQuantity={data.percentageChangeDataItemsQuantity}
          top5ItemsByQuantity={data.top5ItemsByQuantity}
        />
  );
}
