import type { ReactNode } from 'react';
import { SettingsNav } from '@/components/settings/settings-nav';

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-y-auto bg-background">
      <div className="w-full px-8 py-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Update account preferences & manage your team</h1>
          <p className="text-muted-foreground">
            Configure how CashSales works for your organization. Administrators can invite and manage user access.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-10 lg:flex-row">
          <aside className="rounded-lg border bg-card p-4 lg:w-72">
            <SettingsNav />
          </aside>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

