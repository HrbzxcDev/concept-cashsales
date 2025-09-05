'use client';

import { ColumnDef } from '@tanstack/react-table';

export type cashsales = {
  id: string;
  cashsalesdate: string;
  cashsalescode: string;
  customer: string;
  stocklocation: string;
};

export const Cashsalescolumns: ColumnDef<cashsales>[] = [

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

];
