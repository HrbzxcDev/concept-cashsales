import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { ReactNode } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { usersTable } from '@/utils/db/schema';
import { db } from '@/utils/db/drizzle';
import { after } from 'next/server';
import AppSidebar from '@/components/layout/app-sidebar';

export const metadata: Metadata = {
  title: 'Lending and Savings Apps',
  description: 'Lending and Savings Apps'
};

const DashboardLayout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  //first call - redirect to http://localhost:3000/sign-in if no session
  if (!session) redirect('/sign-in');

  after(async () => {
    if (!session?.user?.id) return;

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, session?.user?.id))
      .limit(1);

    if (user[0].lastActivityDate === new Date().toISOString().slice(0, 10))
      return;

    await db
      .update(usersTable)
      .set({ lastActivityDate: new Date().toISOString().slice(0, 10) })
      .where(eq(usersTable.id, session?.user?.id));
  });

  return (
    <>
      <AppSidebar>{children}</AppSidebar>
      <Toaster />
    </>
  );
};

export default DashboardLayout;

