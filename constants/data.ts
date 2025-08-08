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
    title: 'Loans',
    url: '/loans',
    icon: 'pesoicon',
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Savings',
    url: '/savings',
    icon: 'wallet',
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Penalty',
    url: '/penalty',
    icon: 'octagon',
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Service Charge',
    url: '/service-charge',
    icon: 'servicecharge',
    isActive: false,
    items: [] // No child items
  },
  // {
  //   title: 'Kanban',
  //   url: '/dashboard/kanban',
  //   icon: 'kanban',
  //   isActive: false,
  //   items: [] // No child items
  // }
];

export const FIELD_NAMES = {
  username: "Username",
  email: "Email",
  password: "Password",

};

export const FIELD_TYPES = {
  username: "text",
  email: "email",
  password: "password",
};

