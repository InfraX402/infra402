import { useEffect, useState } from 'react';

interface Lease {
  id: string;
  workload: string;
  region: string;
  status: 'running' | 'paused' | 'provisioning';
  leaseEndsIn: string;
  tier: 'cpu' | 'gpu' | 'edge';
  pendingPayment: boolean;
}

interface Props {
  walletAddress: string | null;
}

export default function ResourceList({ walletAddress }: Props) {
  const [resources, setResources] = useState<Lease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const response = await fetch('/api/resources');
        const body = await response.json();
        if (!response.ok) {
          throw new Error(body.message || 'Unable to load resources');
        }
        if (isMounted) {
          setResources(body.resources);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError('Failed to load resources.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <p>Loading resource inventory…</p>;
  }

  if (error) {
    return <p style={{ color: '#fecaca' }}>{error}</p>;
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Container / VM leases</h2>
      <p style={{ color: '#b5c0ff' }}>
        Wallet: {walletAddress ? walletAddress : 'Not connected'}
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {resources.map((resource) => (
          <li key={resource.id} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <strong>{resource.workload}</strong>
              <span
                style={{
                  background: resource.pendingPayment ? '#fed7aa' : '#bbf7d0',
                  color: '#111827',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  padding: '0.1rem 0.6rem',
                }}
              >
                {resource.pendingPayment ? 'PAYMENT HOLD' : resource.status.toUpperCase()}
              </span>
            </div>
            <p style={{ margin: 0, color: '#e5e7eb' }}>
              Region {resource.region} · Tier {resource.tier.toUpperCase()} · Lease ends {resource.leaseEndsIn}
            </p>
            {resource.status === 'running' ? (
              <small style={{ color: '#94a3b8' }}>Streaming telemetry, ready for chat commands.</small>
            ) : (
              <small style={{ color: '#fcd34d' }}>Action required via chat or compute console.</small>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
