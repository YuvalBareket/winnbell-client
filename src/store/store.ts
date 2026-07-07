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
if (typeof window !== 'undefined') {
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
