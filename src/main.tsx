import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // <--- Import this

// 1. Create the Client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:          60_000,      // data is fresh for 1 min by default
      gcTime:             5 * 60_000,  // keep unused data in cache for 5 min
      retry:              1,           // retry once on network failure
      refetchOnWindowFocus: true,      // re-validate when user tabs back in
    },
  },
});

// Reuse the root across Vite HMR updates. Calling createRoot() twice on the
// same container leaves React with a stale tree and throws
// "removeChild ... not a child of this node" on the next reconcile.
const container = document.getElementById('root')!;
const w = window as unknown as { __APP_ROOT__?: ReactDOM.Root };
const root = w.__APP_ROOT__ ?? ReactDOM.createRoot(container);
w.__APP_ROOT__ = root;

root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);
