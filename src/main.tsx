import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // <--- Import this

// 1. Create the Client
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    {/* 2. Wrap your App */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </>,
);
