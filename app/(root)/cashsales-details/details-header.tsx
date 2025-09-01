import PageContainer from '@/components/layout/page-container';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { DataTable } from './data-table';
import { CashsalesdetailsColumns } from './columns';
import { getCashSalesDetailsDataWithCount } from '@/actions/getdata';

type CashSalesDetailsListingPageProps = {};

export default async function CashSalesDetailsListingPage({}: CashSalesDetailsListingPageProps) {
  //* Fetching cash sales details using the getdata function
  let totalCashSalesDetails = 0;
  let cashsalesdetailsData: any[] = [];

  try {
    const { totalCount, data } = await getCashSalesDetailsDataWithCount();
    totalCashSalesDetails = totalCount;
    cashsalesdetailsData = data;
  } catch (error) {
    console.error('Error fetching cash sales details:', error);
    // Handle error appropriately - you might want to show a toast or error message
  }

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <div className="flex place-items-end justify-between">
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