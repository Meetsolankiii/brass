import { useEffect } from 'react';

/**
 * SelfPing component sends a request to the backend health endpoint every 14 minutes
 * to keep the Render free tier instance awake. It does not render any UI.
 */
export default function SelfPing() {
  useEffect(() => {
    const ping = async () => {
      try {
        // Adjust the URL if your frontend is served from a different origin
        await fetch('/api/health', { method: 'GET', cache: 'no-store' });
      } catch (err) {
        // Silently ignore errors; the ping is just to keep the server awake
        console.debug('Self-ping failed', err);
      }
    };

    // Initial ping on mount
    ping();
    // Set interval for every 14 minutes (840,000 ms)
    const intervalId = setInterval(ping, 14 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  // No UI output
  return null;
}
