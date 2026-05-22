import { createContext, useContext } from 'react';

export interface SyncStatusContextValue {
  syncError: boolean;
  retry: () => void;
}

export const SyncStatusContext = createContext<SyncStatusContextValue>({ syncError: false, retry: () => {} });

export const useSyncStatus = () => useContext(SyncStatusContext);
