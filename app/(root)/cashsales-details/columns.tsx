'use client';

import { ColumnDef } from '@tanstack/react-table';
// import { CellAction } from './cell-action';
// import { Checkbox } from '@/components/ui/checkbox';

export type cashsalesdetails = {
  id: string;
  cashsalesdate: string;
  cashsalescode: string;
  numbering: string;
  stockcode: string;
  description: string;
  quantity: number;
  uom: string;
  unitprice: number;
  discount: number;
  amount: number;
  taxcode: string;
  taxamount: number;
  netamount: number;
  glaccount: string;
  stocklocation: string;
  costcentre: string;
  project: string;
  serialnumber: string;
};

// stockid: varchar('stockid', { length: 150 }).notNull(),
// cashsalescode: varchar('cashsalescode', { length: 150 })
//   .notNull()
//   .references(() => cashsalesTable.cashsalescode),
// cashsalesdate: date('cashsalesdate').notNull(),
// numbering: varchar('numbering', { length: 30 }).notNull(),
// stockcode: varchar('stockcode', { length: 100 }).notNull(),
// description: varchar('description', { length: 100 }).notNull(),
// quantity: numeric('quantity').notNull(),
// uom: varchar('uom', { length: 20 }).notNull(),
// unitprice: numeric('unitprice').notNull(),
// discount: numeric('discount').notNull(),
// amount: numeric('amount').notNull(),
// taxcode: varchar('taxcode', { length: 10 }).notNull(),
// taxamount: numeric('taxamount').notNull(),
// netamount: numeric('netamount').notNull(),
// glaccount: varchar('glaccount', { length: 15 }).notNull(),
// stocklocation: varchar('stocklocation', { length: 100 }).notNull(),
// costcentre: varchar('costcentre', { length: 100 }).notNull(),
// project: varchar('project', { length: 100 }).notNull(),
// serialnumber: varchar('serialnumber', { length: 50 }).notNull(),

export const CashsalesdetailsColumns: ColumnDef<cashsalesdetails>[] = [
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
    accessorKey: 'numbering',
    header: () => <div className="text-left">Numbering</div>
  },
  {
    accessorKey: 'stockcode',
    header: () => <div className="text-left">Stock Code</div>
  },
  {
    accessorKey: 'description',
    header: () => <div className="text-left">Description</div>
  },
  {
    accessorKey: 'quantity',
    header: () => <div className="text-left">Quantity</div>
  },
  {
    accessorKey: 'uom',
    header: () => <div className="text-left">UOM</div>
  },
  {
    accessorKey: 'unitprice',
    header: () => <div className="text-left">Unit Price</div>
  },
  {
    accessorKey: 'discount',
    header: () => <div className="text-left">Discount</div>
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-left">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PHP'
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    }
  },
  {
    accessorKey: 'taxcode',
    header: () => <div className="text-left">Tax Code</div>
  },
  {
    accessorKey: 'taxamount',
    header: () => <div className="text-left">Tax Amount</div>
  },
  {
    accessorKey: 'netamount',
    header: () => <div className="text-left">Net Amount</div>
  },
  {
    accessorKey: 'glaccount',
    header: () => <div className="text-left">GL Account</div>
  },
  // {
  //   id: 'actions',
  //   cell: ({ row }) => <CellAction data={row.original} />
  // }
];
