"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCashSalesData, type CashSale } from "@/actions/fetchdata";
import PageContainer from "@/components/layout/page-container";
import { DebugEnv } from "./debug-env";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Activity,
  BarChart3,
} from "lucide-react";

export default function Overview() {
  const [cashSales, setCashSales] = useState<CashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCashSales = async () => {
      try {
        setLoading(true);
        const result = await fetchCashSalesData({ limit: 10 });

        if (result.success) {
          setCashSales(result.data);
        } else {
          setError(result.message || "Failed to fetch data");
        }
      } catch (err) {
        setError("An error occurred while fetching data");
        console.error("Error in loadCashSales:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCashSales();
  }, []);

  // Calculate summary statistics
  const totalSales = cashSales.reduce((sum, sale) => sum + sale.amount, 0);
  const averageSale = cashSales.length > 0 ? totalSales / cashSales.length : 0;
  const totalTransactions = cashSales.length;

  // Mock percentage change functions (you can replace with real data)
  const getPercentageChangeTotalSales = () => 12.5;
  const getPercentageChangeAverageSale = () => -2.3;
  const getPercentageChangeTransactions = () => 8.7;
  const getPercentageChangeActivity = () => 15.2;

  if (loading) {
    return (
      <PageContainer scrollable>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
          <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
          <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
          <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer scrollable>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-full">
            <div className="p-4 border border-destructive rounded-lg">
              <p className="text-destructive">Error: {error}</p>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable>
      {/* <DebugEnv /> */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="h-full w-full rounded-md bg-white dark:bg-neutral-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-thin text-muted-foreground">
              Total Sales
            </CardTitle>
            <DollarSign size={24} color="#333333" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <Skeleton className="h-8 w-[200px] sm:w-[100px] md:w-[100px] lg:w-[240px]" />
              ) : (
                new Intl.NumberFormat("en-PH", {
                  style: "currency",
                  currency: "PHP",
                }).format(totalSales)
              )}
            </div>
            <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
              <Badge
                variant="outline"
                className={
                  getPercentageChangeTotalSales() < 0
                    ? "border-[#ef4444]/0 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/10"
                    : "border-[#10b981]/0 bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/10"
                }
              >
                {getPercentageChangeTotalSales() < 0 ? (
                  <TrendingDown className="mr-1 h-4 w-4" />
                ) : (
                  <TrendingUp className="mr-1 h-4 w-4" />
                )}
                {getPercentageChangeTotalSales()}%
              </Badge>
              From Last Month
            </div>
          </CardContent>
        </Card>

        <Card className="h-full w-full rounded-md bg-white dark:bg-neutral-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-thin text-muted-foreground">
              Average Sale
            </CardTitle>
            <BarChart3 size={24} color="#333333" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <Skeleton className="h-8 w-[200px] sm:w-[100px] md:w-[100px] lg:w-[240px]" />
              ) : (
                new Intl.NumberFormat("en-PH", {
                  style: "currency",
                  currency: "PHP",
                }).format(averageSale)
              )}
            </div>
            <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
              <Badge
                variant="outline"
                className={
                  getPercentageChangeAverageSale() < 0
                    ? "border-[#ef4444]/0 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/10"
                    : "border-[#10b981]/0 bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/10"
                }
              >
                {getPercentageChangeAverageSale() < 0 ? (
                  <TrendingDown className="mr-1 h-4 w-4" />
                ) : (
                  <TrendingUp className="mr-1 h-4 w-4" />
                )}
                {getPercentageChangeAverageSale()}%
              </Badge>
              From Last Month
            </div>
          </CardContent>
        </Card>

        <Card className="h-full w-full rounded-md bg-white dark:bg-neutral-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-thin text-muted-foreground">
              Total Transactions
            </CardTitle>
            <ShoppingCart size={24} color="#333333" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <Skeleton className="h-8 w-[200px] sm:w-[100px] md:w-[100px] lg:w-[240px]" />
              ) : (
                totalTransactions
              )}
            </div>
            <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
              <Badge
                variant="outline"
                className={
                  getPercentageChangeTransactions() < 0
                    ? "border-[#ef4444]/0 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/10"
                    : "border-[#10b981]/0 bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/10"
                }
              >
                {getPercentageChangeTransactions() < 0 ? (
                  <TrendingDown className="mr-1 h-4 w-4" />
                ) : (
                  <TrendingUp className="mr-1 h-4 w-4" />
                )}
                {getPercentageChangeTransactions()}%
              </Badge>
              From Last Month
            </div>
          </CardContent>
        </Card>

        <Card className="h-full w-full rounded-md bg-white dark:bg-neutral-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-thin text-muted-foreground">
              Recent Activity
            </CardTitle>
            <Activity size={24} color="#333333" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <Skeleton className="h-8 w-[200px] sm:w-[100px] md:w-[100px] lg:w-[240px]" />
              ) : cashSales.length > 0 ? (
                cashSales.length
              ) : (
                0
              )}
            </div>
            <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
              <Badge
                variant="outline"
                className={
                  getPercentageChangeActivity() < 0
                    ? "border-[#ef4444]/0 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/10"
                    : "border-[#10b981]/0 bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/10"
                }
              >
                {getPercentageChangeActivity() < 0 ? (
                  <TrendingDown className="mr-1 h-4 w-4" />
                ) : (
                  <TrendingUp className="mr-1 h-4 w-4" />
                )}
                {getPercentageChangeActivity()}%
              </Badge>
              From Last Month
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
