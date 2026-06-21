export interface NavItem {
  label: string;
  icon: string;
  route: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Main',
    items: [
      { label: 'Overview', icon: 'dashboard', route: 'overview' },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Users', icon: 'group', route: 'users' },
      { label: 'Nurses', icon: 'medical_services', route: 'providers' },
      { label: 'Bookings', icon: 'calendar_month', route: 'bookings' },
      { label: 'Services', icon: 'design_services', route: 'services' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Payments', icon: 'payments', route: 'payments' },
      { label: 'Analytics', icon: 'analytics', route: 'analytics' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Reviews', icon: 'star', route: 'reviews' },
      { label: 'Notifications', icon: 'notifications', route: 'notifications' },
      { label: 'Support', icon: 'support_agent', route: 'support' },
      { label: 'Location', icon: 'location_on', route: 'location' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Content', icon: 'edit_note', route: 'content' },
      { label: 'Admins', icon: 'manage_accounts', route: 'admins' },
      { label: 'Roles', icon: 'admin_panel_settings', route: 'roles' },
      { label: 'Marketing', icon: 'campaign', route: 'marketing' },
      { label: 'Settings', icon: 'settings', route: 'settings' },
    ],
  },
];
