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
  Storefront,
} from '@mui/icons-material';
import React from 'react';
import { SECTOR_CONFIG } from '../../shared/sectorConfig';

export const BUSINESS_SECTORS: Record<
  string,
  {
    label: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
  }
> = {
  Food:          { label: 'Food',          icon: <LocalPizza />,       color: SECTOR_CONFIG.Food.color,          bgColor: SECTOR_CONFIG.Food.bgColor },
  Coffee:        { label: 'Coffee',        icon: <Coffee />,           color: SECTOR_CONFIG.Coffee.color,        bgColor: SECTOR_CONFIG.Coffee.bgColor },
  Bakery:        { label: 'Bakery',        icon: <BakeryDining />,     color: SECTOR_CONFIG.Bakery.color,        bgColor: SECTOR_CONFIG.Bakery.bgColor },
  Grocery:       { label: 'Grocery',       icon: <LocalGroceryStore />,color: SECTOR_CONFIG.Grocery.color,       bgColor: SECTOR_CONFIG.Grocery.bgColor },
  Retail:        { label: 'Retail',        icon: <ShoppingBag />,      color: SECTOR_CONFIG.Retail.color,        bgColor: SECTOR_CONFIG.Retail.bgColor },
  Beauty:        { label: 'Beauty',        icon: <Spa />,              color: SECTOR_CONFIG.Beauty.color,        bgColor: SECTOR_CONFIG.Beauty.bgColor },
  Health:        { label: 'Health',        icon: <LocalHospital />,    color: SECTOR_CONFIG.Health.color,        bgColor: SECTOR_CONFIG.Health.bgColor },
  Gym:           { label: 'Gym',           icon: <FitnessCenter />,    color: SECTOR_CONFIG.Gym.color,           bgColor: SECTOR_CONFIG.Gym.bgColor },
  Auto:          { label: 'Auto',          icon: <DirectionsCar />,    color: SECTOR_CONFIG.Auto.color,          bgColor: SECTOR_CONFIG.Auto.bgColor },
  Entertainment: { label: 'Entertainment', icon: <Theaters />,         color: SECTOR_CONFIG.Entertainment.color, bgColor: SECTOR_CONFIG.Entertainment.bgColor },
  Education:     { label: 'Education',     icon: <School />,           color: SECTOR_CONFIG.Education.color,     bgColor: SECTOR_CONFIG.Education.bgColor },
  Service:       { label: 'Service',       icon: <Build />,            color: SECTOR_CONFIG.Service.color,       bgColor: SECTOR_CONFIG.Service.bgColor },
  Free:          { label: 'Free',          icon: <CardGiftcard />,     color: SECTOR_CONFIG.Free.color,          bgColor: SECTOR_CONFIG.Free.bgColor },
};

export type BusinessSector = keyof typeof BUSINESS_SECTORS;

/** Used when a business has a null or unrecognized sector — neutral grey, no misleading category */
export const UNKNOWN_SECTOR = {
  label: 'Other',
  icon: <Storefront />,
  color: '#78909c',
  bgColor: '#eceff1',
} as const;
