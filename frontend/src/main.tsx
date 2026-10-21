import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

// ── Keep Render backend alive ──────────────────────────────────────────────
// Render free tier sleeps after 15 min of inactivity (causes 60-90s cold start).
// We ping /api/health every 14 min so the server never sleeps.
const BACKEND_HEALTH_URL = import.meta.env.PROD
  ? 'https://brass-q9gb.onrender.com/api/health'
  : 'http://localhost:5000/api/health';

const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes

function pingBackend() {
  fetch(BACKEND_HEALTH_URL, { method: 'GET', keepalive: true })
    .then(() => console.debug('[keep-alive] backend pinged ✓'))
    .catch(() => { /* silence — user must not see any network error */ });
}

// Fire immediately on first load to wake Render before user navigates to products
pingBackend();

// Then repeat every 14 minutes to prevent sleep
setInterval(pingBackend, PING_INTERVAL_MS);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
