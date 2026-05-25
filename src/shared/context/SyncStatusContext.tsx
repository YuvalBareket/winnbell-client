import { createContext, useContext } from 'react';

export interface SyncStatusContextValue {
  syncError: boolean;
  retry: () => void;
  isLoaded: boolean;
  isSignedIn: boolean;
}

export const SyncStatusContext = createContext<SyncStatusContextValue>({
  syncError: false,
  retry: () => {},
  isLoaded: false,
  isSignedIn: false,
});

export const useSyncStatus = () => useContext(SyncStatusContext);
