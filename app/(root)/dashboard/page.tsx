import OverViewPage from './_components/overview';
import { gettotaltrans, gettotalbranch, getCashsalesData } from '@/actions/getdata';

export const metadata = {
  title: 'Dashboard : Overview'
};

export default async function Page() {
  // Fetch all data server-side
  const [totalTransactions, totalBranch, cashsalesData] = await Promise.all([
    gettotaltrans(),
    gettotalbranch(),
    getCashsalesData()
  ]);

  return (
    <OverViewPage 
      totalTransactions={totalTransactions}
      totalBranch={totalBranch}
      cashsalesData={cashsalesData}
    />
  );
}
