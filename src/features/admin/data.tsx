// src/features/admin/data/sectors.data.tsx
import {
  LocalPizza,
  Coffee,
  FitnessCenter,
  ShoppingBag,
  Build,
  CardGiftcard,
} from '@mui/icons-material';
import React from 'react';

export const BUSINESS_SECTORS: Record<
  string,
  {
    label: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
  }
> = {
  Food: {
    label: 'Food',
    icon: <LocalPizza />,
    color: '#1976d2',
    bgColor: '#e3f2fd',
  },
  Coffee: {
    label: 'Coffee',
    icon: <Coffee />,
    color: '#795548',
    bgColor: '#efebe9',
  },
  Gym: {
    label: 'Gym',
    icon: <FitnessCenter />,
    color: '#d32f2f',
    bgColor: '#ffebee',
  },
  Retail: {
    label: 'Retail',
    icon: <ShoppingBag />,
    color: '#9c27b0',
    bgColor: '#f3e5f5',
  },
  Service: {
    label: 'Service',
    icon: <Build />,
    color: '#607d8b',
    bgColor: '#eceff1',
  },
  Free: {
    label: 'Free',
    icon: <CardGiftcard />,
    color: '#607d8b',
    bgColor: '#eceff1',
  },
};

export type BusinessSector = keyof typeof BUSINESS_SECTORS;
