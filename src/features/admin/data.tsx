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
  Icecream,
  Blender,
  Liquor,
  NightlifeOutlined,
  VapingRoomsOutlined,
  Checkroom,
  Devices,
  MenuBook,
  LocalFlorist,
  Pets,
} from '@mui/icons-material';
import { SvgIcon, type SvgIconProps } from '@mui/material';
import React from 'react';
import { SECTOR_CONFIG } from '../../shared/sectorConfig';

/** Half-coconut kava bowl — custom glyph shared with the map pins via SECTOR_CONFIG. */
const KavaBowl = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d={SECTOR_CONFIG.Kava.iconPath} />
  </SvgIcon>
);

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
  IceCream:      { label: 'Ice Cream',     icon: <Icecream />,         color: SECTOR_CONFIG.IceCream.color,      bgColor: SECTOR_CONFIG.IceCream.bgColor },
  Juice:         { label: 'Smoothies & Juices', icon: <Blender />,     color: SECTOR_CONFIG.Juice.color,         bgColor: SECTOR_CONFIG.Juice.bgColor },
  Kava:          { label: 'Kava',          icon: <KavaBowl />,         color: SECTOR_CONFIG.Kava.color,      bgColor: SECTOR_CONFIG.Kava.bgColor },
  Grocery:       { label: 'Grocery',       icon: <LocalGroceryStore />,color: SECTOR_CONFIG.Grocery.color,       bgColor: SECTOR_CONFIG.Grocery.bgColor },
  Liquor:        { label: 'Tobacco & Liquor', icon: <Liquor />,        color: SECTOR_CONFIG.Liquor.color,        bgColor: SECTOR_CONFIG.Liquor.bgColor },
  Pub:           { label: 'Pub',           icon: <NightlifeOutlined />, color: SECTOR_CONFIG.Pub.color,          bgColor: SECTOR_CONFIG.Pub.bgColor },
  Vape:          { label: 'Smoke & Vape',  icon: <VapingRoomsOutlined />, color: SECTOR_CONFIG.Vape.color,       bgColor: SECTOR_CONFIG.Vape.bgColor },
  Retail:        { label: 'Retail',        icon: <ShoppingBag />,      color: SECTOR_CONFIG.Retail.color,        bgColor: SECTOR_CONFIG.Retail.bgColor },
  Fashion:       { label: 'Fashion',       icon: <Checkroom />,        color: SECTOR_CONFIG.Fashion.color,       bgColor: SECTOR_CONFIG.Fashion.bgColor },
  Electronics:   { label: 'Electronics',   icon: <Devices />,          color: SECTOR_CONFIG.Electronics.color,   bgColor: SECTOR_CONFIG.Electronics.bgColor },
  Books:         { label: 'Books',         icon: <MenuBook />,         color: SECTOR_CONFIG.Books.color,         bgColor: SECTOR_CONFIG.Books.bgColor },
  Flowers:       { label: 'Flowers',       icon: <LocalFlorist />,     color: SECTOR_CONFIG.Flowers.color,       bgColor: SECTOR_CONFIG.Flowers.bgColor },
  Pets:          { label: 'Pets',          icon: <Pets />,             color: SECTOR_CONFIG.Pets.color,          bgColor: SECTOR_CONFIG.Pets.bgColor },
  Beauty:        { label: 'Beauty',        icon: <Spa />,              color: SECTOR_CONFIG.Beauty.color,        bgColor: SECTOR_CONFIG.Beauty.bgColor },
  Health:        { label: 'Health',        icon: <LocalHospital />,    color: SECTOR_CONFIG.Health.color,        bgColor: SECTOR_CONFIG.Health.bgColor },
  Gym:           { label: 'Gym',           icon: <FitnessCenter />,    color: SECTOR_CONFIG.Gym.color,           bgColor: SECTOR_CONFIG.Gym.bgColor },
  Auto:          { label: 'Auto',          icon: <DirectionsCar />,    color: SECTOR_CONFIG.Auto.color,          bgColor: SECTOR_CONFIG.Auto.bgColor },
  Entertainment: { label: 'Entertainment', icon: <Theaters />,         color: SECTOR_CONFIG.Entertainment.color, bgColor: SECTOR_CONFIG.Entertainment.bgColor },
  Education:     { label: 'Education',     icon: <School />,           color: SECTOR_CONFIG.Education.color,     bgColor: SECTOR_CONFIG.Education.bgColor },
  Service:       { label: 'Service',       icon: <Build />,            color: SECTOR_CONFIG.Service.color,       bgColor: SECTOR_CONFIG.Service.bgColor },
  Other:         { label: 'Other',         icon: <Storefront />,       color: SECTOR_CONFIG.Other.color,         bgColor: SECTOR_CONFIG.Other.bgColor },
  Free:          { label: 'Weekly',        icon: <CardGiftcard />,     color: SECTOR_CONFIG.Free.color,          bgColor: SECTOR_CONFIG.Free.bgColor },
};

export type BusinessSector = keyof typeof BUSINESS_SECTORS;

/** Used when a business has a null or unrecognized sector — neutral grey, no misleading category */
export const UNKNOWN_SECTOR = {
  label: 'Other',
  icon: <Storefront />,
  color: '#78909c',
  bgColor: '#eceff1',
} as const;
