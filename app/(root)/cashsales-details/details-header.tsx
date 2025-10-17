import PageContainer from '@/components/layout/page-container';
import { DataTable } from './data-table';
import { CashsalesdetailsColumns } from './columns';
import { getCashSalesDetailsDataWithCount } from '@/actions/getdata';

type CashSalesDetailsListingPageProps = {};

export default async function CashSalesDetailsListingPage({}: CashSalesDetailsListingPageProps) {
  //* Fetching cash sales details using the getdata function
  let cashsalesdetailsData: any[] = [];

  try {
    const { data, totalCount } = await getCashSalesDetailsDataWithCount();
    cashsalesdetailsData = data;
    
    // Debug logging
    console.log('Cash Sales Details - Total count from DB:', totalCount);
    console.log('Cash Sales Details - Data length:', data.length);
    if (data.length > 0) {
      console.log('Cash Sales Details - Sample data:', data[0]);
      console.log('Cash Sales Details - Date range in data:', {
        earliest: data[data.length - 1]?.cashsalesdate,
        latest: data[0]?.cashsalesdate
      });
    }
  } catch (error) {
    console.error('Error fetching cash sales details:', error);
    // Handle error appropriately - you might want to show a toast or error message
  }

  return (
    <PageContainer scrollable>
      <div className="space-y-0">
        <div className="flex place-items-end justify-between"></div>
        <div className="flex items-start justify-between"></div>
        <DataTable
          columns={CashsalesdetailsColumns}
          data={cashsalesdetailsData}
        />
      </div>
    </PageContainer>
  );
}
