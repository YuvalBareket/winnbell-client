import { createContext, useContext } from 'react';

// Single source of truth for the app menu drawer. MainLayout owns the open state and mounts
// exactly one <AppMenuDrawer/>; every AppPageHero (and the Nearby floating button) opens it via
// this context, so pages no longer each declare their own menuOpen state + drawer instance.
export interface MenuDrawerContextValue {
  openMenu: () => void;
  closeMenu: () => void;
  isOpen: boolean;
}

export const MenuDrawerContext = createContext<MenuDrawerContextValue>({
  openMenu: () => {},
  closeMenu: () => {},
  isOpen: false,
});

export const useMenuDrawer = () => useContext(MenuDrawerContext);
