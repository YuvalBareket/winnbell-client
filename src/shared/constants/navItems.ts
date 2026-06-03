import type { ElementType } from 'react';
import {
  StorefrontOutlined,
  ConfirmationNumberOutlined,
  BusinessOutlined,
  BarChartOutlined,
  ReceiptLongOutlined,
  GavelOutlined,
  PrivacyTipOutlined,
  ArticleOutlined,
  EmojiEventsOutlined,
  AdminPanelSettingsOutlined,
  FeedOutlined,
  SettingsOutlined,
  CampaignOutlined,
  DashboardOutlined,
  PeopleOutlined,
} from '@mui/icons-material';

export interface NavItem {
  label: string;
  Icon: ElementType;
  path: string;
}

export const userNavItems: NavItem[] = [
  { label: 'Nearby Partners', Icon: StorefrontOutlined, path: '/nearby' },
  { label: 'Submit Receipt', Icon: ReceiptLongOutlined, path: '/scan' },
  { label: 'My Entries', Icon: ConfirmationNumberOutlined, path: '/tickets' },
  { label: 'Campaigns Hub', Icon: EmojiEventsOutlined, path: '/draws/history' },
  { label: 'Settings', Icon: SettingsOutlined, path: '/settings' },
];

export const businessNavItems: NavItem[] = [
  { label: 'Business Hub', Icon: BusinessOutlined, path: '/nearby' },
  { label: 'Receipt Activity', Icon: FeedOutlined, path: '/activity' },
  { label: 'Entries', Icon: ConfirmationNumberOutlined, path: '/tickets' },
  { label: 'Statistics', Icon: BarChartOutlined, path: '/stats' },
  { label: 'Campaign', Icon: ReceiptLongOutlined, path: '/subscription/manage' },
  { label: 'Marketing', Icon: CampaignOutlined, path: '/marketing' },
  { label: 'Settings', Icon: SettingsOutlined, path: '/settings' },
];

export const managerNavItems: NavItem[] = [
  { label: 'Nearby Partners', Icon: StorefrontOutlined, path: '/nearby' },
  { label: 'Receipt Activity', Icon: FeedOutlined, path: '/activity' },
  { label: 'Entries', Icon: ConfirmationNumberOutlined, path: '/tickets' },
  { label: 'Statistics', Icon: BarChartOutlined, path: '/stats' },
  { label: 'Settings', Icon: SettingsOutlined, path: '/settings' },
];

export const adminNavItems: NavItem[] = [
  { label: 'Overview', Icon: DashboardOutlined, path: '/admin' },
  { label: 'Campaigns', Icon: AdminPanelSettingsOutlined, path: '/admin/campaigns' },
  { label: 'Users', Icon: PeopleOutlined, path: '/admin/users' },
  { label: 'Businesses', Icon: BusinessOutlined, path: '/admin/businesses' },
  { label: 'Analytics', Icon: BarChartOutlined, path: '/admin/analytics' },
  { label: 'Settings', Icon: SettingsOutlined, path: '/admin/settings' },
];

export const legalNavItems: NavItem[] = [
  { label: 'Terms of Service', Icon: GavelOutlined, path: '/terms' },
  { label: 'Privacy Policy', Icon: PrivacyTipOutlined, path: '/privacy' },
];

export const businessLegalNavItems: NavItem[] = [
  ...legalNavItems,
  { label: 'Business Agreement', Icon: ArticleOutlined, path: '/business-agreement' },
];
