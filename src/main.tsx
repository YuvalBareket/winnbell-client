import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // <--- Import this

// 1. Create the Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:          60_000,      // data is fresh for 1 min by default
      gcTime:             5 * 60_000,  // keep unused data in cache for 5 min
      retry:              1,           // retry once on network failure
      refetchOnWindowFocus: true,      // re-validate when user tabs back in
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    {/* 2. Wrap your App */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </>,
);
