import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import { persistedReducer } from './rootReducer';

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// F2: redux-persist writes to storage asynchronously (debounced). A refresh token rotated
// moments before the OS freezes or kills the tab - routine on mobile / installed PWAs when the
// user switches away - can be lost, leaving the OLD, now-consumed token on disk and logging the
// user out on next launch. `pagehide` and the page turning `hidden` are the last reliable moments
// on mobile (mobile browsers often skip `beforeunload`) to force the pending state to disk.
// localStorage.setItem is synchronous, so the flush completes before the tab is suspended.
// Guard against duplicate registration when Vite HMR re-evaluates this module in dev
// (same pattern as __APP_ROOT__ in main.tsx). flush() is idempotent, so duplicates would
// be harmless, but there is no reason to accumulate listeners.
const w = typeof window !== 'undefined' ? (window as unknown as { __FLUSH_ON_HIDE__?: boolean }) : null;
if (w && !w.__FLUSH_ON_HIDE__) {
  w.__FLUSH_ON_HIDE__ = true;
  const flushToDisk = (): void => {
    void persistor.flush();
  };
  window.addEventListener('pagehide', flushToDisk);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushToDisk();
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
