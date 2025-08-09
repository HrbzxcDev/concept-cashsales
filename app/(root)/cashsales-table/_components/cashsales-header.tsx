import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { db } from '@/utils/db/drizzle'; // Import your Drizzle connection
import { cashsalesTable } from '@/utils/db/schema'; // Import your loans schema
import { cn } from '@/lib/utils';
import { DataTable } from './cashsales-tables/data-table'; // Ensure this path is correct
import { Cashsalescolumns } from './cashsales-tables/columns';
import { sql } from 'drizzle-orm';
import { toast } from '@/hooks/use-toast';
import AddButton from '@/components/animata/button/add-button';

type CashsalesListingPageProps = {};

export default async function CashsalesListingPage({}: CashsalesListingPageProps) {
  //* Fetching loans directly from the database using Drizzle
  let totalServCharge = 0;
  let ServChargeData: any[] = [];

  try {
    //* First, get a count of all rows
    const countResult = await db
      .select({ count: sql`count(*)` })
      .from(cashsalesTable);
    totalServCharge = Number(countResult[0].count); //* Assign to totalSavings

    //* Then fetch all rows, ordered by month
    ServChargeData = await db.select().from(cashsalesTable); //* Adjust the column name if needed
  } catch (error) {
    toast({ 
      title: 'Error',
      description: 'Error Fetching Record'
    });
  }

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <div className="flex place-items-end justify-between">
          <Heading
            title={`Service Charge ( ${totalServCharge} )`}
            description="Manage Service Charge"
          />
          <AddButton
            href="/service-charge/new"
            text="Add Charge"
          />
        </div>
        <Separator
          className={cn(
            ' bg-[radial-gradient(circle_farthest-side_at_0_100%,#00ccb1,transparent),radial-gradient(circle_farthest-side_at_100%_0,#7b61ff,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#ffc414,transparent),radial-gradient(circle_farthest-side_at_0_0,#1ca0fb,#141316)]'
          )}
        />
        <div className="flex items-start justify-between"></div>
        <DataTable columns={Cashsalescolumns} data={ServChargeData} />
      </div>
    </PageContainer>
  );
}
