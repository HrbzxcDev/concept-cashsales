import DashboardWrapper from './_components/dashboard-wrapper';

export const metadata = {
  title: 'Dashboard : Overview'
};

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

export default function Page() {
  return <DashboardWrapper />;
}
