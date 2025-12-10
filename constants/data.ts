import { NavItem } from '@/types/index';


export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: 'dashboard',
    isActive: false,
    items: [] // Empty array as there are no child items for Dashboa
  },
  {
    title: 'CashSales Details',
    url: '/cashsales-details',
    icon: 'listCollapse',
    isActive: false,
    items: [] // Empty array as there are no child items for CashSales Details
  },
  {
    title: 'Settings',
    url: '/settings/users',
    icon: 'settings',
    isActive: false,
    items: [] // Empty array as there are no child items for Users
  },


];
