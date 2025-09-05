'use client';

import { ColumnDef } from '@tanstack/react-table';


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


export const CashsalesdetailsColumns: ColumnDef<cashsalesdetails>[] = [
  {
    accessorKey: 'cashsalesdate',
    header: () => <div className="text-center">CashSales Date</div>,
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
    header: () => <div className="text-center">CashSales Code</div>,
    size: 150,
    cell: ({ row }) => {
      const cashsalescode = row.getValue('cashsalescode') as string;
      return <div className="text-center font-medium">{cashsalescode}</div>;
    }
  },
  {
    accessorKey: 'numbering',
    header: () => <div className="text-center">Numbering</div>,
    size: 100,
    cell: ({ row }) => {
      const numbering = row.getValue('numbering') as string;
      return <div className="text-center font-medium">{numbering}</div>;
    }
  },
  {
    accessorKey: 'stockcode',
    header: () => <div className="text-center">Stock Code</div>,
    size: 120,
    cell: ({ row }) => {
      const stockcode = row.getValue('stockcode') as string;
      return <div className="text-center font-medium">{stockcode}</div>;
    } 
  },
  {
    accessorKey: 'description',
    header: () => <div className="text-center">Description</div>,
    size: 200,
    cell: ({ row }) => {
      const description = row.getValue('description') as string;
      return <div className="text-center font-medium">{description}</div>;
    }
  },
  {
    accessorKey: 'quantity',
    header: () => <div className="text-center">Qty</div>,
    size: 100,
    cell: ({ row }) => {
      const quantity = row.getValue('quantity') as string;
      return <div className="text-center font-medium">{quantity}</div>;
    }
  },
  {
    accessorKey: 'uom',
    header: () => <div className="text-left">UOM</div>,
    size: 80,
    cell: ({ row }) => {
      const uom = row.getValue('uom') as string;
      return <div className="text-center font-medium">{uom}</div>;
    }
  },
  {
    accessorKey: 'unitprice',
    header: () => <div className="text-center">Unit Price</div>,
    size: 120,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('unitprice'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PHP'
      }).format(amount);

      return <div className="text-center font-medium">{formatted}</div>;
    }
  },
  {
    accessorKey: 'discount',
    header: () => <div className="text-center">Discount</div>,
    size: 120,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('discount'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PHP'
      }).format(amount);

      return <div className="text-center font-medium">{formatted}</div>;
    }
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-center">Amount</div>,
    size: 120,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PHP'
      }).format(amount);

      return <div className="text-center font-medium">{formatted}</div>;
    }
  },
  {
    accessorKey: 'taxcode',
    header: () => <div className="text-center">Tax Code</div>,
    size: 100,
    cell: ({ row }) => {
      const taxcode = row.getValue('taxcode') as string;
      return <div className="text-center font-medium">{taxcode}</div>;
    }
  },
  {
    accessorKey: 'taxamount',
    header: () => <div className="text-center">Tax Amount</div>,
    size: 120,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('taxamount'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PHP'
      }).format(amount);

      return <div className="text-center font-medium">{formatted}</div>;
    }
  },
  {
    accessorKey: 'netamount',
    header: () => <div className="text-center">Net Amount</div>,
    size: 120,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('netamount'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PHP'
      }).format(amount);

      return <div className="text-center font-medium">{formatted}</div>;
    }
  },
  {
    accessorKey: 'project',
    header: () => <div className="text-center">Location</div>,
    size: 150, 
    cell: ({ row }) => {
      const project = row.getValue('project') as string;
      return <div className="text-center font-medium">{project}</div>;
    }
  },
];
