import { useEffect, useState } from 'react';

type Status = 'idle' | 'loading' | 'ready' | 'error';

export default function MiniAppStatus() {
  const [status, setStatus] = useState<Status>('idle');
  const [details, setDetails] = useState('Idle');

  useEffect(() => {
    let cancelled = false;

    const detect = async () => {
      try {
        setStatus('loading');
        setDetails('Checking Farcaster mini app environment…');
        const sdk = await import('@farcaster/miniapp-sdk');
        if (cancelled) {
          return;
        }
        const client = new sdk.MiniAppClient();
        const env = (client as unknown as { environment?: string; platform?: string }) || {};
        setStatus('ready');
        setDetails(
          env.environment
            ? `Mini app SDK ready (${env.environment})`
            : env.platform
            ? `Mini app SDK ready on ${env.platform}`
            : 'Mini app SDK ready',
        );
      } catch (error) {
        console.error('mini app init failed', error);
        if (!cancelled) {
          setStatus('error');
          setDetails('Mini app SDK unavailable. Falling back to browser mode.');
        }
      }
    };

    detect();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ fontSize: '0.9rem', color: status === 'error' ? '#fecaca' : '#bbf7d0' }}>
      {status === 'idle' && 'Mini app status pending'}
      {status === 'loading' && 'Detecting Farcaster mini app…'}
      {status === 'ready' && details}
      {status === 'error' && details}
    </div>
  );
}
