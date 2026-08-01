import type { ElementType } from 'react';
import {
  StorefrontOutlined,
  ConfirmationNumberOutlined,
  BusinessOutlined,
  BarChartOutlined,
  ReceiptLongOutlined,
  GavelOutlined,
  MailOutline,
  PrivacyTipOutlined,
  ArticleOutlined,
  EmojiEventsOutlined,
  AdminPanelSettingsOutlined,
  SettingsOutlined,
  CampaignOutlined,
  DashboardOutlined,
  PeopleOutlined,
  NotificationsOutlined,
  CardGiftcardOutlined,
  RocketLaunchOutlined,
} from '@mui/icons-material';

export interface NavItem {
  label: string;
  Icon: ElementType;
  path: string;
}

export const userNavItems: NavItem[] = [
  { label: 'Nearby Businesses', Icon: StorefrontOutlined, path: '/nearby' },
  { label: 'Entry submission', Icon: ReceiptLongOutlined, path: '/scan' },
  { label: 'My Entries', Icon: ConfirmationNumberOutlined, path: '/tickets' },
  { label: 'Campaigns Hub', Icon: EmojiEventsOutlined, path: '/draws/history' },
  { label: 'Invite Friends', Icon: CardGiftcardOutlined, path: '/invite' },
  { label: 'Profile Settings', Icon: SettingsOutlined, path: '/settings' },
];

export const businessNavItems: NavItem[] = [
  { label: 'Business Hub', Icon: BusinessOutlined, path: '/nearby' },
  { label: 'Campaign Dashboard', Icon: CampaignOutlined, path: '/campaign' },
  { label: 'Analytics', Icon: BarChartOutlined, path: '/stats' },
  { label: 'Campaigns Hub', Icon: EmojiEventsOutlined, path: '/draws/history' },
  { label: 'My Plan', Icon: ReceiptLongOutlined, path: '/subscription/manage' },
  { label: 'Grow', Icon: RocketLaunchOutlined, path: '/marketing' },
  { label: 'Profile Settings', Icon: SettingsOutlined, path: '/settings' },
];

// Managers get the Marketing page where owners have the Business Hub - branch
// managers don't manage the business profile/locations, but they do promote.
export const managerNavItems: NavItem[] = [
  { label: 'Marketing', Icon: RocketLaunchOutlined, path: '/marketing' },
  { label: 'Campaign Dashboard', Icon: CampaignOutlined, path: '/campaign' },
  { label: 'Analytics', Icon: BarChartOutlined, path: '/stats' },
  { label: 'Profile Settings', Icon: SettingsOutlined, path: '/settings' },
];

export const adminNavItems: NavItem[] = [
  { label: 'Overview', Icon: DashboardOutlined, path: '/admin' },
  { label: 'Campaigns', Icon: AdminPanelSettingsOutlined, path: '/admin/campaigns' },
  { label: 'Users', Icon: PeopleOutlined, path: '/admin/users' },
  { label: 'Businesses', Icon: BusinessOutlined, path: '/admin/businesses' },
  { label: 'Analytics', Icon: BarChartOutlined, path: '/admin/analytics' },
  { label: 'Notifications', Icon: NotificationsOutlined, path: '/admin/notifications' },
  { label: 'Settings', Icon: SettingsOutlined, path: '/admin/settings' },
];

export const legalNavItems: NavItem[] = [
  { label: 'Contact us', Icon: MailOutline, path: '/contact' },
  { label: 'Terms of Service', Icon: GavelOutlined, path: '/terms' },
  { label: 'Privacy Policy', Icon: PrivacyTipOutlined, path: '/privacy' },
];

export const businessLegalNavItems: NavItem[] = [
  ...legalNavItems,
  { label: 'Business Agreement', Icon: ArticleOutlined, path: '/business-agreement' },
];
