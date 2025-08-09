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
import { CalendarDays, ChevronLeftIcon, ChevronRightIcon, Search } from 'lucide-react';
import * as React from 'react';
import { Input } from '@/components/ui/input';

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

  const [yearFilter, setYearFilter] = React.useState<number | null>(2025);
  const [searchValue, setSearchValue] = React.useState<string>('');
  const filteredData = React.useMemo(() => {
    return data
      .filter((item) => {
        if (yearFilter) {
          const cashsalesdate = new Date((item as any).cashsalesdate);
          return cashsalesdate.getFullYear() === yearFilter;
        }
        return true;
      })
      .filter((item) => {
        const cashsalesdate = new Date((item as any).cashsalesdate);
        const formattedDateString = cashsalesdate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        return formattedDateString
          .toLowerCase()
          .includes(searchValue.toLowerCase());
      })
      .sort((a, b) => {
        const nameA = new Date((a as any).cashsalesdate).toLocaleDateString('en-US');
        const nameB = new Date((b as any).cashsalesdate).toLocaleDateString('en-US');
        return nameA.localeCompare(nameB);
      });
  }, [data, yearFilter, searchValue]);

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


  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

        {/* <BackgroundGradient className="w-full h-full rounded-md bg-white dark:bg-neutral-900">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-l font-thin">
              Total Service Fee
            </CardTitle>
            <DollarSign size={24} color="#333333" strokeWidth={1.5} />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP'
              }).format(fee)}
            </div>
          </CardContent>
   
        </BackgroundGradient> */}

        <div className="flex w-full items-end">
          <Select
            value={yearFilter ? yearFilter.toString() : 'All Years'}
            onValueChange={(value) => {
              setYearFilter(value === 'All Years' ? null : Number(value));
            }}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Filter Year" />
            </SelectTrigger>
            <SelectContent side="bottom">
            <SelectItem value="All Years">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span>All Years</span>
              </div>
            </SelectItem>
          </SelectContent>
          </Select>
        </div>

        {/* Search Input in the last column */}
        <div className="flex w-full items-end">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search Date..."
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="h-10 w-full pl-9"
            />
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(80vh-220px)] rounded-md border md:h-[calc(85dvh-240px)]">
        <Table className="relative">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="bg-neutral-800">
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
    </div>
  );
}
