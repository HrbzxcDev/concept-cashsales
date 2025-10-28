'use client';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon
} from '@radix-ui/react-icons';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  useReactTable,
  getPaginationRowModel
} from '@tanstack/react-table';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Search,
  X,
  Braces,
  Unplug,
  ShoppingBasket,
  Info,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DateRange } from 'react-day-picker';
// import { isWithinInterval, endOfDay, startOfDay, addDays } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import type {
  CashSaleDetailResponse,
  CashSaleDetailLine
} from '@/actions/cashsales-client';
import { fetchCashSaleDetailByCode } from '@/actions/cashsales-client';
import {
  getStockCodeTotals,
  getStockCodeMonthlyTransactions
} from '@/actions/getdata';
import { CalendarDateRangePicker } from '@/components/ui/date-range-picker';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<any>(null);
  const [detail, setDetail] = React.useState<CashSaleDetailResponse | null>(
    null
  );
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState<string | null>(null);
  const [jsonDialogOpen, setJsonDialogOpen] = React.useState(false);
  const [summaryRowData, setSummaryRowData] = React.useState<any>(null);
  const [stockCodeTotals, setStockCodeTotals] = React.useState<any>(null);
  const [stockCodeTotalsLoading, setStockCodeTotalsLoading] =
    React.useState(false);
  const [dailyTransactionData, setDailyTransactionData] = React.useState<any[]>(
    []
  );
  const [dailyTransactionLoading, setDailyTransactionLoading] =
    React.useState(false);
  const [monthlyFilter, setMonthlyFilter] = React.useState<string>(() => {
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
    return currentMonth;
  });
  const [previousMonthData, setPreviousMonthData] = React.useState<any>(null);

  // Function to calculate percentage change
  const calculatePercentageChange = (
    current: number,
    previous: number
  ): number => {
    // Debug logging
    // console.log('Percentage calculation:', { current, previous });

    // If previous is null or undefined, don't show percentage
    if (previous == null) return NaN;
    // If both are 0, no change (0%)
    if (current === 0 && previous === 0) return 0;
    // If previous is 0 but current has value, it's 100% increase
    if (previous === 0 && current > 0) return 100;
    // If current is 0 but previous had value, it's -100% (complete drop)
    if (current === 0 && previous > 0) return -100;
    // Normal percentage calculation
    const result = ((current - previous) / previous) * 100;
    // console.log('Percentage result:', result);
    return result;
  };

  // Function to get previous month name
  const getPreviousMonth = (currentMonth: string): string => {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    const currentIndex = monthNames.indexOf(currentMonth);
    const previousIndex = currentIndex === 0 ? 11 : currentIndex - 1;
    return monthNames[previousIndex];
  };

  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    return {
      from: yesterday,
      to: today
    };
  });
  const [searchValue, setSearchValue] = React.useState<string>('');

  // Helper function to parse dates consistently
  const parseDate = (dateInput: any): string => {
    if (!dateInput) return '';
    
    if (typeof dateInput === 'string') {
      // Handle string dates - try to extract YYYY-MM-DD part
      const match = dateInput.match(/(\d{4}-\d{2}-\d{2})/);
      if (match) {
        return match[1];
      }
      // If no match, try to parse as Date
      const parsed = new Date(dateInput);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    } else if (dateInput instanceof Date) {
      return dateInput.toISOString().split('T')[0];
    }
    
    return '';
  };

  const filteredData = React.useMemo(() => {

    const dateFiltered = data.filter((item) => {
      if (dateRange?.from && dateRange?.to) {
        // Simple approach: convert everything to Date objects and compare
        const itemDate = new Date((item as any).cashsalesdate);
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);
        
        // Set time to start/end of day for accurate comparison
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
        itemDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
        
        const isInRange = itemDate >= fromDate && itemDate <= toDate;
        
        
        return isInRange;
      }
      return true;
    });

    const searchFiltered = dateFiltered.filter((item) => {
      if (!searchValue) return true;

      const searchLower = searchValue.toLowerCase();

      // Search in all fields
      const matches = (
        (item as any).cashsalescode?.toLowerCase().includes(searchLower) ||
        (item as any).stockcode?.toLowerCase().includes(searchLower) ||
        (item as any).description?.toLowerCase().includes(searchLower)
      );
      
      return matches;
    });

    return searchFiltered.sort((a, b) => {
      const dateA = new Date((a as any).cashsalesdate);
      const dateB = new Date((b as any).cashsalesdate);
      return dateA.getTime() - dateB.getTime(); // Sort by earliest date first (Oct 16 first)
    });
  }, [data, dateRange, searchValue]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters
    }
  });

  // Fetch stock code totals when a row is clicked
  const fetchStockCodeTotals = async (stockCode: string) => {
    if (!stockCode) return;
    try {
      setStockCodeTotalsLoading(true);
      setDailyTransactionLoading(true);

      // Fetch totals, monthly transaction data, and previous month data in parallel
      const previousMonth = getPreviousMonth(monthlyFilter);
      const [totals, monthlyData, previousData] = await Promise.all([
        getStockCodeTotals(stockCode, monthlyFilter),
        getStockCodeMonthlyTransactions(stockCode, monthlyFilter),
        getStockCodeTotals(stockCode, previousMonth)
      ]);

      setStockCodeTotals(totals);
      setDailyTransactionData(monthlyData);
      setPreviousMonthData(previousData);
    } catch (err) {
      // console.error('Error fetching stock code data:', err);
      setStockCodeTotals(null);
      setDailyTransactionData([]);
      setPreviousMonthData(null);
    } finally {
      setStockCodeTotalsLoading(false);
      setDailyTransactionLoading(false);
    }
  };

  // Fetch monthly filtered data when filter changes
  const fetchMonthlyData = async (stockCode: string, month: string) => {
    if (!stockCode) return;
    try {
      setDailyTransactionLoading(true);

      // Fetch current month totals, monthly transaction data, and previous month data in parallel
      const previousMonth = getPreviousMonth(month);
      const [currentTotals, monthlyData, previousData] = await Promise.all([
        getStockCodeTotals(stockCode, month),
        getStockCodeMonthlyTransactions(stockCode, month),
        getStockCodeTotals(stockCode, previousMonth)
      ]);

      setStockCodeTotals(currentTotals);
      setDailyTransactionData(monthlyData);
      setPreviousMonthData(previousData);
    } catch (err) {
      // console.error('Error fetching monthly data:', err);
      setStockCodeTotals(null);
      setDailyTransactionData([]);
      setPreviousMonthData(null);
    } finally {
      setDailyTransactionLoading(false);
    }
  };

  // Fetch detail when dialog opens for a specific row
  React.useEffect(() => {
    const run = async () => {
      if (!dialogOpen || !selectedRow) return;
      const code =
        (selectedRow as any)?.cashsalescode ||
        (selectedRow as any)?.cashSalesCode;
      if (!code) return;
      try {
        setDetailLoading(true);
        setDetailError(null);
        const res = await fetchCashSaleDetailByCode(code);
        setDetail(res);
      } catch (err) {
        setDetailError(
          err instanceof Error ? err.message : 'Failed To Load Details'
        );
        setDetail(null);
      } finally {
        setDetailLoading(false);
      }
    };
    run();
  }, [dialogOpen, selectedRow]);

  function SummaryTable({ data }: { data: CashSaleDetailResponse }) {
    const rows: Array<[string, React.ReactNode]> = [
      ['Cash Sales ID', data.id],
      [
        'Cash Sales Date',
        new Date(data.cashSalesDate).toLocaleDateString('en-PH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      ],
      ['Cash Sales Code', data.cashSalesCode],
      ['Customer', data.customer],
      ['Customer Name', data.customerName ?? '-'],
      ['Stock Location', data.stockLocation ?? '-'],
      ['Sales Person', data.salesPerson ?? '-'],
      ['Deposit To', data.depositTo ?? '-'],
      ['Reference No', data.referenceNo ?? '-'],
      ['MultiPayment', String(Boolean(data.useMultiPayment)).toUpperCase()],
      ['Project', data.project ?? '-']
    ] as any;

    const handleViewJSON = () => {
      setJsonDialogOpen(true);
    };

    return (
      <div className="rounded-md border bg-card">
        <div className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-semibold">Transaction Summary</div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewJSON}
              className="flex items-center gap-2"
            >
              <Braces className="h-4 w-4" />
              View JSON
            </Button>
          </div>
        </div>
        <div className="px-4 pb-4">
          <Table>
            <TableBody>
              {rows.map(([label, value]: [string, React.ReactNode]) => (
                <TableRow key={label}>
                  <TableCell className="w-48 py-2 text-sm text-muted-foreground">
                    {label}
                  </TableCell>
                  <TableCell className="py-2 text-sm font-medium">
                    {value}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Percentage Badge Component
  function PercentageBadge({
    percentage,
    className = ''
  }: {
    percentage: number;
    className?: string;
  }) {
    // Don't show if percentage is NaN or Infinity
    if (!isFinite(percentage)) return null;

    const isPositive = percentage > 0;
    const isZero = percentage === 0;

    // Choose icon based on percentage
    let icon;
    if (isZero) {
      // For 0%, use a neutral icon or no icon
      icon = null;
    } else if (isPositive) {
      icon = <TrendingUp className="mr-1 h-4 w-4" />;
    } else {
      icon = <TrendingDown className="mr-1 h-4 w-4" />;
    }

    // Choose color based on percentage
    let colorClass;
    if (isZero) {
      colorClass =
        'border-[#6b7280]/0 bg-[#6b7280]/10 text-[#6b7280] hover:bg-[#6b7280]/10';
    } else if (isPositive) {
      colorClass =
        'border-[#10b981]/0 bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/10';
    } else {
      colorClass =
        'border-[#ef4444]/0 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/10';
    }

    return (
      <Badge variant="outline" className={`${colorClass} ${className}`}>
        {icon}
        {Math.abs(percentage).toFixed(1)}%
      </Badge>
    );
  }

  function SummaryCard({ rowData }: { rowData: any }) {
    const formatMoney = (n: any) =>
      typeof n === 'number'
        ? n.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })
        : n ?? '-';

    const formatNumber = (n: any) =>
      typeof n === 'number'
        ? n.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
          })
        : n ?? '-';

    const hasData = rowData && Object.keys(rowData).length > 0;
    const hasStockCodeTotals = stockCodeTotals && !stockCodeTotalsLoading;

    return (
      <div className="w-full rounded-lg border p-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-zinc-800 p-2">
              <ShoppingBasket className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold dark:text-white">
                <p>Item Summary</p>
              </h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {hasData ? (
                  <>
                    <span>
                      Summary for{' '}
                      <span className="text-lg font-medium dark:text-white">
                        {rowData?.description ||
                          rowData?.cashsalescode ||
                          'Selected Item'}
                      </span>
                    </span>
                    <span>|</span>
                    <span>
                      Stock Code:{' '}
                      <span className="text-lg font-medium dark:text-white">
                        {rowData?.stockcode || '-'}
                      </span>
                    </span>
                  </>
                ) : (
                  'Click on any row to view item summary'
                )}
              </div>
            </div>
          </div>

          {/* Monthly Filter */}
          {hasData && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filter:</span>
              <Select
                value={monthlyFilter}
                onValueChange={(value) => {
                  setMonthlyFilter(value);
                  if (rowData?.stockcode) {
                    fetchMonthlyData(rowData.stockcode, value);
                  }
                }}
              >
                <SelectTrigger className="h-8 w-32 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="January">January</SelectItem>
                  <SelectItem value="February">February</SelectItem>
                  <SelectItem value="March">March</SelectItem>
                  <SelectItem value="April">April</SelectItem>
                  <SelectItem value="May">May</SelectItem>
                  <SelectItem value="June">June</SelectItem>
                  <SelectItem value="July">July</SelectItem>
                  <SelectItem value="August">August</SelectItem>
                  <SelectItem value="September">September</SelectItem>
                  <SelectItem value="October">October</SelectItem>
                  <SelectItem value="November">November</SelectItem>
                  <SelectItem value="December">December</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {stockCodeTotalsLoading ? (
          <div className="h-[284px] py-12 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800 p-4">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-slate-400"></div>
            </div>
            <p className="mb-2 text-xl font-medium dark:before:text-white">
              Loading Item Summary
            </p>
            <p className="text-sm text-muted-foreground">
              Fetching Aggregated Data For All Transactions...
            </p>
          </div>
        ) : hasData ? (
          <div className="p-1">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="col-span-1 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Net Sales */}
                <Card className="border-gray-300 shadow-[5px_5px_5px_rgba(0,0,0,0.1)] dark:border-zinc-800">
                  <CardContent className="p-4">
                    <div className="mb-1 flex items-center justify-between text-base text-muted-foreground">
                      <span>Net Sales</span>
                      <Info className="h-3 w-3 opacity-70" />
                    </div>
                    <div className="text-2xl font-bold">
                      ₱{' '}
                      {formatMoney(
                        hasStockCodeTotals
                          ? stockCodeTotals?.totalAmount
                          : rowData?.amount || 0
                      )}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {hasStockCodeTotals
                          ? 'Total from all transactions'
                          : 'From selected transaction'}
                      </div>
                      <PercentageBadge
                        percentage={calculatePercentageChange(
                          hasStockCodeTotals
                            ? stockCodeTotals?.totalAmount || 0
                            : rowData?.amount || 0,
                          previousMonthData?.totalAmount || 0
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Net Amount */}
                <Card className="border-gray-300 shadow-[5px_5px_5px_rgba(0,0,0,0.1)] dark:border-zinc-800">
                  <CardContent className="p-4">
                    <div className="mb-1 flex items-center justify-between text-base text-muted-foreground">
                      <span>Net Amount</span>
                      <Info className="h-3 w-3 opacity-70" />
                    </div>
                    <div className="text-2xl font-bold">
                      ₱{' '}
                      {formatMoney(
                        hasStockCodeTotals
                          ? stockCodeTotals?.totalNetAmount
                          : rowData?.netamount || 0
                      )}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {hasStockCodeTotals
                          ? 'Total net amount from all transactions'
                          : 'Total net amount'}
                      </div>
                      <PercentageBadge
                        percentage={calculatePercentageChange(
                          hasStockCodeTotals
                            ? stockCodeTotals?.totalNetAmount || 0
                            : rowData?.netamount || 0,
                          previousMonthData?.totalNetAmount || 0
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Orders */}
                <Card className="border-gray-300 shadow-[5px_5px_5px_rgba(0,0,0,0.1)] dark:border-zinc-800">
                  <CardContent className="p-4">
                    <div className="mb-1 flex items-center justify-between text-base text-muted-foreground">
                      <span>Orders</span>
                      <Info className="h-3 w-3 opacity-70" />
                    </div>
                    <div className="text-2xl font-bold">
                      {formatNumber(
                        hasStockCodeTotals
                          ? stockCodeTotals?.totalQuantity
                          : rowData?.quantity || 0
                      )}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {hasStockCodeTotals
                          ? 'Total quantity from all transactions'
                          : 'Total quantity'}
                      </div>
                      <PercentageBadge
                        percentage={calculatePercentageChange(
                          hasStockCodeTotals
                            ? stockCodeTotals?.totalQuantity || 0
                            : rowData?.quantity || 0,
                          previousMonthData?.totalQuantity || 0
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Discount */}
                <Card className="border-gray-300 shadow-[5px_5px_5px_rgba(0,0,0,0.1)] dark:border-zinc-800">
                  <CardContent className="p-4">
                    <div className="mb-1 flex items-center justify-between text-base text-muted-foreground">
                      <span>Discount</span>
                      <Info className="h-3 w-3 opacity-70" />
                    </div>
                    <div className="text-2xl font-bold">
                      ₱{' '}
                      {formatMoney(
                        hasStockCodeTotals
                          ? stockCodeTotals?.totalDiscount
                          : rowData?.discount || 0
                      )}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {hasStockCodeTotals
                          ? 'Total discount from all transactions'
                          : 'Applied discount'}
                      </div>
                      <PercentageBadge
                        percentage={calculatePercentageChange(
                          hasStockCodeTotals
                            ? stockCodeTotals?.totalDiscount || 0
                            : rowData?.discount || 0,
                          previousMonthData?.totalDiscount || 0
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Tax Amount */}
                <Card className="border-gray-300 shadow-[5px_5px_5px_rgba(0,0,0,0.1)] dark:border-zinc-800">
                  <CardContent className="p-4">
                    <div className="mb-1 flex items-center justify-between text-base text-muted-foreground">
                      <span>Tax Amount</span>
                      <Info className="h-3 w-3 opacity-70" />
                    </div>
                    <div className="text-2xl font-bold">
                      ₱{' '}
                      {formatMoney(
                        hasStockCodeTotals
                          ? stockCodeTotals?.totalTaxAmount
                          : rowData?.taxamount || 0
                      )}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {hasStockCodeTotals
                          ? 'Total tax from all transactions'
                          : 'Computed tax'}
                      </div>
                      <PercentageBadge
                        percentage={calculatePercentageChange(
                          hasStockCodeTotals
                            ? stockCodeTotals?.totalTaxAmount || 0
                            : rowData?.taxamount || 0,
                          previousMonthData?.totalTaxAmount || 0
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Total Transactions */}
                <Card className="border-gray-300 shadow-[5px_5px_5px_rgba(0,0,0,0.1)] dark:border-zinc-800">
                  <CardContent className="p-4">
                    <div className="mb-1 flex items-center justify-between text-base text-muted-foreground">
                      <span>Total Transactions</span>
                      <Info className="h-3 w-3 opacity-70" />
                    </div>
                    <div className="text-2xl font-bold">
                      {formatNumber(
                        hasStockCodeTotals
                          ? stockCodeTotals?.transactionCount
                          : rowData?.transactioncount || 0
                      )}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {hasStockCodeTotals
                          ? 'Total transactions from all transactions'
                          : 'Total transactions'}
                      </div>
                      <PercentageBadge
                        percentage={calculatePercentageChange(
                          hasStockCodeTotals
                            ? stockCodeTotals?.transactionCount || 0
                            : rowData?.transactioncount || 0,
                          previousMonthData?.transactionCount || 0
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Graph area */}
              <div className="col-span-1 md:col-span-1">
                {(() => {
                  if (dailyTransactionLoading) {
                    return (
                      <div className="flex h-[270px] items-center justify-center">
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-900"></div>
                          <p className="text-sm">Loading Chart Data...</p>
                        </div>
                      </div>
                    );
                  }

                  if (
                    !dailyTransactionData ||
                    dailyTransactionData.length === 0
                  ) {
                    return (
                      <div className="flex h-[270px] items-center justify-center">
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <p className="text-sm">
                            No Transaction Data Available
                          </p>
                        </div>
                      </div>
                    );
                  }

                  // Create chart data from daily transaction data
                  const chartData = dailyTransactionData.map((item) => ({
                    date: new Date(item.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    }),
                    transactions: item.dailyTransactionCount,
                    quantity: item.dailyQuantity
                  }));

                  const chartConfig = {
                    quantity: {
                      label: 'Quantity',
                      color: 'hsl(var(--chart-2))'
                    },
                    transactions: {
                      label: 'Transactions',
                      color: 'hsl(var(--chart-1))'
                    }
                  };

                  return (
                    <div className="h-[270px] p-2 ">
                      <ChartContainer
                        config={chartConfig}
                        className="h-full w-full"
                      >
                        <BarChart accessibilityLayer data={chartData}>
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            interval="preserveStartEnd"
                            tick={{ fontSize: 10 }}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dashed" />}
                          />
                          <Bar
                            dataKey="transactions"
                            stackId="a"
                            fill="hsl(var(--chart-1))"
                            radius={[0, 0, 4, 4]}
                            barSize={20}
                          />
                          <Bar
                            dataKey="quantity"
                            stackId="a"
                            fill="hsl(var(--chart-2))"
                            radius={[4, 4, 0, 0]}
                            barSize={20}
                          />
                        </BarChart>
                      </ChartContainer>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[292px] py-12 text-center text-slate-500">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800 p-4">
              <ShoppingBasket className="h-10 w-10 opacity-50" />
            </div>
            <p className="mb-2 text-xl font-medium text-white">
              No Item Selected
            </p>
            <p className="text-sm text-muted-foreground">
              Click on any table row to view its summary
            </p>
          </div>
        )}
      </div>
    );
  }

  function DetailsTable({ lines = [] as CashSaleDetailLine[] }) {
    if (!lines || lines.length === 0) {
      return (
        <div className="text-sm text-muted-foreground">No line items.</div>
      );
    }
    const formatMoney = (n: any) =>
      typeof n === 'number'
        ? n.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })
        : n ?? '-';
    const sorted = [...lines].sort((a, b) => {
      const na = Number(a.numbering ?? 0);
      const nb = Number(b.numbering ?? 0);
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb; // ascending by line #
      return String(a.description || '').localeCompare(
        String(b.description || '')
      );
    });

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-sm font-semibold">#</TableHead>
              <TableHead className="text-sm font-semibold">
                Stock Code
              </TableHead>
              <TableHead className="text-sm font-semibold">
                Description
              </TableHead>
              <TableHead className="text-right text-sm font-semibold">
                Qty
              </TableHead>
              <TableHead className="text-sm font-semibold">UOM</TableHead>
              <TableHead className="text-right text-sm font-semibold">
                Unit Price
              </TableHead>
              <TableHead className="text-right text-sm font-semibold">
                Discount
              </TableHead>
              <TableHead className="text-right text-sm font-semibold">
                Amount
              </TableHead>
              <TableHead className="text-sm font-semibold">Tax Code</TableHead>
              <TableHead className="text-right text-sm font-semibold">
                Tax Amount
              </TableHead>
              <TableHead className="text-right text-sm font-semibold">
                Net Amount
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="text-sm">{l.numbering}</TableCell>
                <TableCell className="text-sm">{l.stock}</TableCell>
                <TableCell className="text-sm">{l.description}</TableCell>
                <TableCell className="text-right text-sm">{l.qty}</TableCell>
                <TableCell className="text-sm">{l.uom}</TableCell>
                <TableCell className="text-right text-sm">
                  {formatMoney(l.unitPrice)}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {formatMoney(l.discount)}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {formatMoney(l.amount)}
                </TableCell>
                <TableCell className="text-sm">{l.taxCode ?? '-'}</TableCell>
                <TableCell className="text-right text-sm">
                  {formatMoney(l.taxAmount)}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {formatMoney(l.netAmount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card - always visible */}
      <SummaryCard rowData={summaryRowData} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="w-full min-w-0">
          <CalendarDateRangePicker
            className="w-full"
            date={dateRange}
            onDateChange={(newDateRange) => {
              // console.log('Date range changed:', newDateRange);
              setDateRange(newDateRange);
            }}
          />
        </div>
        <div className="w-full min-w-0">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search CashSales Code, Stock Code, or Description..."
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="h-10 w-full pl-9 pr-9 placeholder:text-sm"
            />
            {searchValue && (
              <button
                onClick={() => setSearchValue('')}
                className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="relative">
          {/* Fixed Header */}
          <div className="sticky top-2 z-10 bg-card px-4 pb-2 ">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="align-middle text-sm font-semibold text-muted-foreground"
                        style={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
            </Table>
          </div>

          {/* Scrollable Body */}
          <ScrollArea className="h-[calc(80vh-280px)] md:h-[calc(100dvh-400px)]">
            <div className="px-4 pb-4">
              <Table>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                        className={`cursor-pointer hover:bg-muted/50`}
                        onClick={() => {
                          const rowData = row.original as any;
                          setSelectedRow(rowData);
                          setSummaryRowData(rowData);
                          // Fetch stock code totals for the clicked row
                          if (rowData?.stockcode) {
                            fetchStockCodeTotals(rowData.stockcode);
                          }
                        }}
                        onDoubleClick={() => {
                          setSelectedRow(row.original as any);
                          setDialogOpen(true);
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className="py-2.5"
                            style={{ width: cell.column.getSize() }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        {dateRange?.from && dateRange?.to ? (
                          <div className="space-y-2">
                            <p className="text-lg font-medium">No Results</p>
                            <p className="text-sm text-muted-foreground">
                              No data found for {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
                            </p>
                          </div>
                        ) : (
                          "No Results."
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </div>
      </div>

      {/* Pagination function */}
      <div className="flex items-center justify-between px-2 pb-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <DoubleArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Dialog Box */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[80vh] max-w-7xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cash Sales Details</DialogTitle>
            <DialogDescription>
              Information for the selected row.
            </DialogDescription>
          </DialogHeader>
          {detailLoading && (
            <div className="space-y-6">
              {/* Summary Table Skeleton */}
              <div className="rounded-md border bg-card">
                <div className="p-4">
                  <div className="mb-4 h-6 w-48 animate-pulse rounded bg-muted"></div>
                </div>
                <div className="px-4 pb-4">
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex space-x-4">
                        <div className="h-8 w-48 animate-pulse rounded bg-muted"></div>
                        <div className="h-8 flex-1 animate-pulse rounded bg-muted"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Details Table Skeleton */}
              <div className="rounded-md border">
                <div className="p-4">
                  <div className="mb-4 h-6 w-24 animate-pulse rounded bg-muted"></div>
                </div>
                <div className="overflow-x-auto">
                  <div className="h-full w-full">
                    <div className="px-4 pb-4">
                      <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex space-x-8">
                            <div className="h-4 w-8 animate-pulse rounded bg-muted"></div>
                            <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
                            <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
                            <div className="h-4 w-12 animate-pulse rounded bg-muted"></div>
                            <div className="h-4 w-16 animate-pulse rounded bg-muted"></div>
                            <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
                            <div className="h-4 w-16 animate-pulse rounded bg-muted"></div>
                            <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
                            <div className="h-4 w-16 animate-pulse rounded bg-muted"></div>
                            <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
                            <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {detailError && (
            <div className="mb-4 py-6 text-center">
              <div className="mb-4 text-lg text-red-500">{detailError}</div>
              <div className="flex flex-col items-center justify-center gap-4 text-white">
                <Unplug className="h-24 w-24" strokeWidth={1} />
                <span>Can&apos;t Retrieve Data From The Server!</span>
              </div>
            </div>
          )}
          {!detailLoading && !detailError && detail && (
            <div className="space-y-6">
              <SummaryTable data={detail} />
              <div className="overflow-x-auto">
                <ScrollArea className="h-[60vh] w-full">
                  <DetailsTable lines={detail.details || []} />
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* JSON Dialog */}
      <Dialog open={jsonDialogOpen} onOpenChange={setJsonDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl">
          <DialogHeader>
            <DialogTitle>Transaction JSON Data</DialogTitle>
            <DialogDescription>
              Raw JSON data for the selected transaction.
            </DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="rounded-md border bg-muted p-4">
                <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap text-sm">
                  {JSON.stringify(detail, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
