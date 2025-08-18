import OverViewPage from './_components/overview';
import {
  gettotaltrans,
  gettotalbranch,
  getCashsalesData,
  getPercentageChangeTotalTransaction
} from '@/actions/getdata';

export const metadata = {
  title: 'Dashboard : Overview'
};

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

export default async function Page() {
  // Fetch all data server-side
  const [totalTransactions, totalBranch, cashsalesData, percentageChangeData] =
    await Promise.all([
      gettotaltrans(),
      gettotalbranch(),
      getCashsalesData(),
      getPercentageChangeTotalTransaction()
    ]);

  return (
    <OverViewPage
      totalTransactions={totalTransactions}
      totalBranch={totalBranch}
      cashsalesData={cashsalesData}
      percentageChangeData={percentageChangeData}
    />
  );
}
