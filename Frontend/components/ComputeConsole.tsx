import { useState } from 'react';
import { parseX402Header, X402Challenge } from '../lib/x402';

interface Props {
  walletAddress: string | null;
}

export default function ComputeConsole({ walletAddress }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<X402Challenge | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const requestAction = async (action: string) => {
    setIsLoading(true);
    setStatus(null);
    setChallenge(null);
    setLastAction(action);
    try {
      const response = await fetch('/api/premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, walletAddress }),
      });
      const body = await response.json();

      if (response.ok) {
        setStatus(body.message || 'Action executed successfully.');
        setChallenge(null);
        return;
      }

      if (response.status === 402) {
        const parsed = parseX402Header(response.headers.get('WWW-Authenticate'));
        setChallenge(parsed);
        setStatus(
          body.message ||
            'This lease or compute action needs payment. Use the Coinbase x402 info below to proceed.',
        );
        return;
      }

      setStatus(body.message || 'Unexpected error while dispatching the action.');
    } catch (error) {
      console.error(error);
      setStatus('Backend unreachable. Ensure the FastAPI x402 proxy is running on port 4021.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Compute lease console</h2>
      <p style={{ color: '#cbd5f5' }}>
        Queue lease renewals, pause workloads, or request GPU time. Heavy actions can trigger HTTP 402 challenges. Wallet:
        {walletAddress ? ` ${walletAddress}` : ' connect one to attribute leases.'}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <button disabled={isLoading} onClick={() => requestAction('renew-lease')}>
          {isLoading && lastAction === 'renew-lease' ? 'Renewing…' : 'Renew current lease'}
        </button>
        <button disabled={isLoading} onClick={() => requestAction('scale-gpu')}>
          {isLoading && lastAction === 'scale-gpu' ? 'Scaling…' : 'Request GPU burst'}
        </button>
        <button disabled={isLoading} onClick={() => requestAction('pause-instance')}>
          {isLoading && lastAction === 'pause-instance' ? 'Pausing…' : 'Pause workload'}
        </button>
      </div>

      {status && <p style={{ marginTop: '0.75rem', color: '#9cdcfe' }}>{status}</p>}

      {challenge && (
        <div style={{ marginTop: '1rem', padding: '1rem', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '8px' }}>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            Backend responded with <strong>HTTP 402</strong>.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.95rem', color: '#d9f99d' }}>
            <li>Scheme: {challenge.scheme}</li>
            {Object.entries(challenge.params).map(([key, value]) => (
              <li key={key}>
                {key}: <code>{value}</code>
              </li>
            ))}
          </ul>
          <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#cbd5f5' }}>
            Follow the Coinbase x402 instructions from <code>WWW-Authenticate</code> and replay the action with the signed
            receipt to finalize the lease.
          </p>
        </div>
      )}
    </div>
  );
}
