import type { ElementType } from 'react';
import {
  StorefrontOutlined,
  QrCodeScannerOutlined,
  ConfirmationNumberOutlined,
  BusinessOutlined,
  BarChartOutlined,
  ReceiptLongOutlined,
  GavelOutlined,
  PrivacyTipOutlined,
  EmojiEventsOutlined,
  AdminPanelSettingsOutlined,
} from '@mui/icons-material';

export interface NavItem {
  label: string;
  Icon: ElementType;
  path: string;
}

export const userNavItems: NavItem[] = [
  { label: 'Nearby Partners', Icon: StorefrontOutlined, path: '/nearby' },
  { label: 'Submit Receipt', Icon: ReceiptLongOutlined, path: '/scan' },
  { label: 'My Tickets', Icon: ConfirmationNumberOutlined, path: '/tickets' },
  { label: 'Draw History', Icon: EmojiEventsOutlined, path: '/draws/history' },
];

export const businessNavItems: NavItem[] = [
  { label: 'Business Hub', Icon: BusinessOutlined, path: '/nearby' },
  { label: 'Generate Ticket', Icon: QrCodeScannerOutlined, path: '/scan' },
  { label: 'Tickets', Icon: ConfirmationNumberOutlined, path: '/tickets' },
  { label: 'Statistics', Icon: BarChartOutlined, path: '/stats' },
  { label: 'Subscription', Icon: ReceiptLongOutlined, path: '/subscription/manage' },
];

export const managerNavItems: NavItem[] = [
  { label: 'Business Hub', Icon: BusinessOutlined, path: '/nearby' },
  { label: 'Generate Ticket', Icon: QrCodeScannerOutlined, path: '/scan' },
  { label: 'Tickets', Icon: ConfirmationNumberOutlined, path: '/tickets' },
  { label: 'Statistics', Icon: BarChartOutlined, path: '/stats' },
];

export const adminNavItems: NavItem[] = [
  { label: 'Admin Dashboard', Icon: AdminPanelSettingsOutlined, path: '/admin' },
];

export const legalNavItems: NavItem[] = [
  { label: 'Terms of Service', Icon: GavelOutlined, path: '/terms' },
  { label: 'Privacy Policy', Icon: PrivacyTipOutlined, path: '/privacy' },
];
