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
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Search,
  X,
  Filter,
  Check,
  MapPinHouse,
  Hash,
  Braces,
  Unplug,
  ShoppingBasket
} from 'lucide-react';
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
import { Card } from '@/components/ui/card';


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

  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    to: new Date()
  });
  const [searchValue, setSearchValue] = React.useState<string>('');
  const [filterType, setFilterType] = React.useState<
    'all' | 'cashsalescode' | 'stocklocation' | 'description'
  >('all');
  const [filterDropdownOpen, setFilterDropdownOpen] = React.useState(false);
  const filterDropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setFilterDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        if (!searchValue) return true;

        const searchLower = searchValue.toLowerCase();

        if (filterType === 'cashsalescode') {
          return (item as any).cashsalescode
            .toLowerCase()
            .includes(searchLower);
        } else if (filterType === 'stocklocation') {
          return (item as any).stocklocation
            .toLowerCase()
            .includes(searchLower);
        } else if (filterType === 'description') {
          return (item as any).description
            .toLowerCase()
            .includes(searchLower);
        } else {
          // Search in both fields when filter type is 'all'
          return (
            (item as any).cashsalescode.toLowerCase().includes(searchLower) ||
            (item as any).stocklocation.toLowerCase().includes(searchLower)
          );
        }
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

    //Dialog Box Table
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="w-full min-w-0">
          <CalendarDateRangePicker
            className="w-full"
            date={dateRange}
            onDateChange={setDateRange}
          />
        </div>

        <div className="w-full min-w-0" ref={filterDropdownRef}>
          <div className="relative">
            <button
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span>
                  {filterType === 'all' && 'All Fields'}
                  {filterType === 'cashsalescode' && 'CashSales Code'}
                  {filterType === 'stocklocation' && 'Stock Location'}
                </span>
              </div>
              <ChevronRightIcon className="h-4 w-4 rotate-90 text-muted-foreground" />
            </button>

            {filterDropdownOpen && (
              <div className="absolute top-full z-50 mt-2 w-full rounded-md border bg-popover shadow-md">
                <div className="p-1">
                  <button
                    onClick={() => {
                      setFilterType('all');
                      setFilterDropdownOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-sm px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <span>All Fields</span>
                    </div>
                    {filterType === 'all' && <Check className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setFilterType('cashsalescode');
                      setFilterDropdownOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-sm px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    <div className="flex items-center gap-2">
                       <Hash  className="h-4 w-4 text-muted-foreground" />
                      <span>CashSales Code</span>
                    </div>
                    {filterType === 'cashsalescode' && (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setFilterType('stocklocation');
                      setFilterDropdownOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-sm px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    <div className="flex items-center gap-2">
                    <MapPinHouse  className="h-4 w-4 text-muted-foreground" />
                      <span>Stock Location</span>
                    </div>
                    {filterType === 'stocklocation' && (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setFilterType('description');
                      setFilterDropdownOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-sm px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    <div className="flex items-center gap-2">
                    <ShoppingBasket  className="h-4 w-4 text-muted-foreground" />
                      <span>Description</span>
                    </div>
                    {filterType === 'description' && (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="w-full min-w-0">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={
                filterType === 'all'
                  ? 'CashSalesCode or Stock Location or Description...'
                  : filterType === 'cashsalescode'
                  ? 'Search CashSales Code...'
                  : filterType === 'stocklocation'
                  ? 'Search Stock Location...'
                  : filterType === 'description'
                  ? 'Search Description...'
                  : 'Search CashSales Code or Stock Location...'
              }
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
        {/* <div className="p-4">
           <div className="mb-4 text-lg font-semibold">Cash Sales</div>
         </div> */}

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
                        className="cursor-pointer hover:bg-muted/50 "
                        onClick={() => {
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
                        No Results.
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
             <div className="py-6 mb-4 text-center">
               <div className="text-lg text-red-500 mb-4">
                 {detailError}
               </div>
               <div className="flex flex-col items-center justify-center gap-4 text-white">
                 <Unplug className="h-24 w-24" 
                 strokeWidth={1}
                 />
                 <span>Can't Retrieve Data From The Server!</span>
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
                <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-[60vh]">
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
