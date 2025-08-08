import { redirect } from 'next/navigation';
import OverViewPage from './_components/overview';
import { auth } from '@/auth';

export const metadata = {
  title: 'Dashboard : Overview'
};

export default async function Page() {
  const session = await auth();
  if (!session) redirect("/sign-in")
  return <OverViewPage />;
}
