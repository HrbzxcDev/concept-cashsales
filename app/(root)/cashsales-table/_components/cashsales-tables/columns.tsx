'use client';

import { ColumnDef } from '@tanstack/react-table';
// import { CellAction } from './cell-action';
// import { Checkbox } from '@/components/ui/checkbox';

export type cashsales = {
  id: string;
  cashsalesdate: string;
  cashsalescode: string;
  customer: string;
  stocklocation: string;
};

export const Cashsalescolumns: ColumnDef<cashsales>[] = [
  // {
  //   id: 'select',
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={table.getIsAllPageRowsSelected()}
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: true,
  //   enableHiding: true
  // },

  {
    accessorKey: 'cashsalesdate',
    header: () => <div className="text-left">CashSales Date</div>,
    cell: ({ row }) => {
      const date = new Date(row.getValue('cashsalesdate'));
      return date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  },
  {
    accessorKey: 'cashsalescode',
    header: () => <div className="text-left">CashSales Code</div>
  },
  {
    accessorKey: 'customer',
    header: () => <div className="text-left">Branch</div>
  },
  {
    accessorKey: 'stocklocation',
    header: () => <div className="text-left">Stock Location</div>
  }
  // {
  //   id: 'actions',
  //   cell: ({ row }) => <CellAction data={row.original} />
  // }
];
