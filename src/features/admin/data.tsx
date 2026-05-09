// src/features/admin/data/sectors.data.tsx
import {
  LocalPizza,
  Coffee,
  FitnessCenter,
  ShoppingBag,
  Build,
  CardGiftcard,
  Spa,
  LocalHospital,
  DirectionsCar,
  Theaters,
  BakeryDining,
  LocalGroceryStore,
  School,
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
  Bakery: {
    label: 'Bakery',
    icon: <BakeryDining />,
    color: '#e65100',
    bgColor: '#fff3e0',
  },
  Grocery: {
    label: 'Grocery',
    icon: <LocalGroceryStore />,
    color: '#2e7d32',
    bgColor: '#e8f5e9',
  },
  Retail: {
    label: 'Retail',
    icon: <ShoppingBag />,
    color: '#9c27b0',
    bgColor: '#f3e5f5',
  },
  Beauty: {
    label: 'Beauty',
    icon: <Spa />,
    color: '#c2185b',
    bgColor: '#fce4ec',
  },
  Health: {
    label: 'Health',
    icon: <LocalHospital />,
    color: '#00897b',
    bgColor: '#e0f2f1',
  },
  Gym: {
    label: 'Gym',
    icon: <FitnessCenter />,
    color: '#d32f2f',
    bgColor: '#ffebee',
  },
  Auto: {
    label: 'Auto',
    icon: <DirectionsCar />,
    color: '#37474f',
    bgColor: '#eceff1',
  },
  Entertainment: {
    label: 'Entertainment',
    icon: <Theaters />,
    color: '#f57c00',
    bgColor: '#fff8e1',
  },
  Education: {
    label: 'Education',
    icon: <School />,
    color: '#1565c0',
    bgColor: '#e3f2fd',
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
