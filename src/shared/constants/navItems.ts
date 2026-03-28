import { ElementType } from 'react';
import {
  StorefrontOutlined,
  QrCodeScannerOutlined,
  ConfirmationNumberOutlined,
  BusinessOutlined,
  BarChartOutlined,
  HelpOutlineOutlined,
  GavelOutlined,
  PrivacyTipOutlined,
} from '@mui/icons-material';

export interface NavItem {
  label: string;
  Icon: ElementType;
  path: string;
}

export const userNavItems: NavItem[] = [
  { label: 'Nearby Partners', Icon: StorefrontOutlined, path: '/nearby' },
  { label: 'Scan QR Code', Icon: QrCodeScannerOutlined, path: '/scan' },
  { label: 'My Tickets', Icon: ConfirmationNumberOutlined, path: '/tickets' },
];

export const businessNavItems: NavItem[] = [
  { label: 'Business Hub', Icon: BusinessOutlined, path: '/nearby' },
  { label: 'Scan Ticket', Icon: QrCodeScannerOutlined, path: '/scan' },
  { label: 'Tickets', Icon: ConfirmationNumberOutlined, path: '/tickets' },
  { label: 'Statistics', Icon: BarChartOutlined, path: '/stats' },
];

export const legalNavItems: NavItem[] = [
  { label: 'Help & Support', Icon: HelpOutlineOutlined, path: '/help' },
  { label: 'Terms of Service', Icon: GavelOutlined, path: '/terms' },
  { label: 'Privacy Policy', Icon: PrivacyTipOutlined, path: '/privacy' },
];
