import type { NextApiRequest, NextApiResponse } from 'next';

const resources = [
  {
    id: 'vm-401',
    workload: 'edge-latency',
    region: 'fra-1',
    status: 'running',
    leaseEndsIn: '18 min',
    tier: 'edge',
    pendingPayment: false,
  },
  {
    id: 'vm-402',
    workload: 'gpu-postproc',
    region: 'iad-1',
    status: 'running',
    leaseEndsIn: '4 min',
    tier: 'gpu',
    pendingPayment: true,
  },
  {
    id: 'ct-82',
    workload: 'api-proxy',
    region: 'sfo-1',
    status: 'paused',
    leaseEndsIn: 'paused',
    tier: 'cpu',
    pendingPayment: false,
  },
];

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ resources });
}
