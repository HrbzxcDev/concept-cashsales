import PageContainer from '@/components/layout/page-container';
// import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { db } from '@/utils/db/drizzle'; // Import your Drizzle connection
import { cashsalesdetailsTable } from '@/utils/db/schema'; // Import your cashsalesdetails schema
import { cn } from '@/lib/utils';
import { DataTable } from './data-table'; // Ensure this path is correct
import { CashsalesdetailsColumns } from './columns';
import { sql } from 'drizzle-orm';
import { toast } from '@/hooks/use-toast';
// import AddButton from '@/components/animata/button/add-button';

type CashSalesDetailsListingPageProps = {};

export default async function CashSalesDetailsListingPage({}: CashSalesDetailsListingPageProps) {
  //* Fetching loans directly from the database using Drizzle
  let totalCashSalesDetails = 0;
  let cashsalesdetailsData: any[] = [];

  try {
    //* First, get a count of all rows
    const countResult = await db
      .select({ count: sql`count(*)` })
        .from(cashsalesdetailsTable);
    totalCashSalesDetails = Number(countResult[0].count); //* Assign to totalCashSalesDetails

    //* Then fetch all rows
    cashsalesdetailsData = await db.select().from(cashsalesdetailsTable); //* Adjust the column name if needed
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Error Fetching Loans Record'
    });
  }

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <div className="flex place-items-end justify-between">
          {/* <Heading
            title={`Cash Sales Details ( ${totalCashSalesDetails} )`}
            description="Manage cash sales details"
          />
          <AddButton
            href="/cashsales-details/new"
            text="Add Cash Sales Details"
          /> */}
        </div>
        <Separator
          className={cn(
            ' bg-[radial-gradient(circle_farthest-side_at_0_100%,#00ccb1,transparent),radial-gradient(circle_farthest-side_at_100%_0,#7b61ff,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#ffc414,transparent),radial-gradient(circle_farthest-side_at_0_0,#1ca0fb,#141316)]'
          )}
        />
        <div className="flex items-start justify-between"></div>
        <DataTable columns={CashsalesdetailsColumns} data={cashsalesdetailsData} />
      </div>
    </PageContainer>
  );
}