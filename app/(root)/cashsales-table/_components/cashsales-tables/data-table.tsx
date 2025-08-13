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
import { CalendarDateRangePicker } from '@/components/ui/date-range-picker';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
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
import { ChevronLeftIcon, ChevronRightIcon, Search } from 'lucide-react';
import * as React from 'react';
import { Input } from '@/components/ui/input';
import { DateRange } from 'react-day-picker';
import { isWithinInterval, endOfDay, startOfDay } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import type {
  CashSaleDetailResponse,
  CashSaleDetailLine
} from '@/actions/cashsales-client';
import { fetchCashSaleDetailByCode } from '@/actions/cashsales-client';

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

  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    to: new Date()
  });
  const [searchValue, setSearchValue] = React.useState<string>('');
  const filteredData = React.useMemo(() => {
    return data
      .filter((item) => {
        if (dateRange?.from && dateRange?.to) {
          const cashsalesdate = new Date((item as any).cashsalesdate);
          return isWithinInterval(cashsalesdate, {
            start: startOfDay(dateRange.from),
            end: endOfDay(dateRange.to)
          });
        }
        return true;
      })
      .filter((item) => {
        return (item as any).cashsalescode
          .toLowerCase()
          .includes(searchValue.toLowerCase());
      })
      .sort((a, b) => {
        const nameA = new Date((a as any).cashsalesdate).toLocaleDateString(
          'en-US'
        );
        const nameB = new Date((b as any).cashsalesdate).toLocaleDateString(
          'en-US'
        );
        return nameA.localeCompare(nameB);
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

  function renderSelectedRowDetails(row: any) {
    if (!row) return null;
    const hasCashsalesShape =
      'cashsalesdate' in row ||
      'cashsalescode' in row ||
      'customer' in row ||
      'stocklocation' in row;

    if (hasCashsalesShape) {
      const dateStr = row.cashsalesdate
        ? new Date(row.cashsalesdate).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : '';
      return (
        <div className="grid gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">CashSales Date</span>
            <span className="font-medium">{dateStr}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">CashSales Code</span>
            <span className="font-medium">{row.cashsalescode || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Branch</span>
            <span className="font-medium">{row.customer || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Stock Location</span>
            <span className="font-medium">{row.stocklocation || '-'}</span>
          </div>
        </div>
      );
    }

    return (
      <pre className="max-h-[50vh] overflow-auto rounded bg-muted p-3 text-xs">
        {JSON.stringify(row, null, 2)}
      </pre>
    );
  }

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
          err instanceof Error ? err.message : 'Failed to load details'
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
      ['ID', data.id],
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
      // ['Term', data.term ?? '-'],
      ['Stock Location', data.stockLocation ?? '-'],
      // ['Currency', data.currency ?? '-'],
      ['Sales Person', data.salesPerson ?? '-'],
      ['Deposit To', data.depositTo ?? '-'],
      ['Reference No', data.referenceNo ?? '-'],
      ['useMultiPayment', String(Boolean(data.useMultiPayment))],
      ['Project', data.project ?? '-']

      // ['Currency Rate', data.currencyRate ?? '-'],
      // ['Post To AR', String(Boolean(data.isPostToAR))]
    ] as any;

    return (
      <div className="rounded-md border">
        <Table>
          <TableBody>
            {rows.map(([label, value]: [string, React.ReactNode]) => (
              <TableRow key={label}>
                <TableCell className="w-48 text-xs text-muted-foreground">
                  {label}
                </TableCell>
                <TableCell className="text-xs font-medium">{value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  function DetailsTable({ lines = [] as CashSaleDetailLine[] }) {
    if (!lines || lines.length === 0) {
      return (
        <div className="text-xs text-muted-foreground">No line items.</div>
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
              <TableHead className="text-xs font-semibold">#</TableHead>
              <TableHead className="text-xs font-semibold">Stock #</TableHead>
              <TableHead className="text-xs font-semibold">
                Description
              </TableHead>
              <TableHead className="text-right text-xs font-semibold">Qty</TableHead>
              <TableHead className="text-xs font-semibold">UOM</TableHead>
              <TableHead className="text-right text-xs font-semibold">Unit Price</TableHead>
              <TableHead className="text-right text-xs font-semibold">Discount</TableHead>
              <TableHead className="text-right text-xs font-semibold">Amount</TableHead>
              <TableHead className="text-xs font-semibold">Tax Code</TableHead>
              <TableHead className="text-right text-xs font-semibold">Tax Amt</TableHead>
              <TableHead className="text-right text-xs font-semibold">Net Amt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="text-xs">{l.numbering}</TableCell>
                <TableCell className="text-xs">{l.stock}</TableCell>
                <TableCell className="text-xs">{l.description}</TableCell>
                <TableCell className="text-right text-xs">{l.qty}</TableCell>
                <TableCell className="text-xs">{l.uom}</TableCell>
                <TableCell className="text-right text-xs">
                  {formatMoney(l.unitPrice)}
                </TableCell>
                <TableCell className="text-right text-xs">
                  {formatMoney(l.discount)}
                </TableCell>
                <TableCell className="text-right text-xs">
                  {formatMoney(l.amount)}
                </TableCell>
                <TableCell className="text-xs">{l.taxCode ?? '-'}</TableCell>
                <TableCell className="text-right text-xs">
                  {formatMoney(l.taxAmount)}
                </TableCell>
                <TableCell className="text-right text-xs">
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="w-full min-w-0">
          <CalendarDateRangePicker
            className="w-full"
            date={dateRange}
            onDateChange={setDateRange}
          />
        </div>

        <div className="w-full min-w-0">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search CashSales Code..."
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="h-10 w-full pl-9"
            />
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(80vh-220px)] rounded-md border md:h-[calc(85dvh-330px)]">
        <Table className="relative">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-md bg-muted font-semibold text-muted-foreground"
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
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    setSelectedRow(row.original as any);
                    setDialogOpen(true);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="vertical" />
      </ScrollArea>

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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-6xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cash Sales Details</DialogTitle>
            <DialogDescription>
              Information for the selected row.
            </DialogDescription>
          </DialogHeader>
          {detailLoading && (
            <div className="text-md py-6 text-center text-muted-foreground">
              Loading details…
            </div>
          )}
          {detailError && (
            <div className="py-6 text-sm text-red-600">{detailError}</div>
          )}
          {!detailLoading && !detailError && detail && (
            <div className="space-y-4">
              <SummaryTable data={detail} />
              <div>
                <div className="mb-2 text-sm font-semibold">Items</div>
                <div className="overflow-x-auto">
                  <ScrollArea className="h-[45vh]">
                    <DetailsTable lines={detail.details || []} />
                    <ScrollBar orientation="vertical" />
                  </ScrollArea>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
