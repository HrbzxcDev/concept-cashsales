'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { Bell, CreditCard, Link2, Settings, UsersRound } from 'lucide-react';

export interface SettingsNavItem {
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

export const settingsNavItems: SettingsNavItem[] = [
  { label: 'General', description: 'Overview & preferences', icon: Settings, href: '/settings/general' },
  { label: 'Users', description: 'Manage access & roles', icon: UsersRound, href: '/settings/users' },
  { label: 'Billing', description: 'Payments & invoices', icon: CreditCard, href: '/settings/billing' },
  { label: 'Plans', description: 'Usage & plan limits', icon: UsersRound, href: '/settings/plans' },
  { label: 'Connected Apps', description: 'Integrations & tokens', icon: Link2, href: '/settings/connected-apps' },
  { label: 'Notifications', description: 'Email & alerts', icon: Bell, href: '/settings/notifications' },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {settingsNavItems.map((item) => {
        const active = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'flex w-full items-start gap-3 rounded-md border px-3 py-3 text-left transition-colors',
              active
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted/30 hover:text-foreground'
            )}
          >
            <item.icon className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <div className="text-sm font-medium leading-tight">{item.label}</div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

