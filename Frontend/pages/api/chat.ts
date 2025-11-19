import type { NextApiRequest, NextApiResponse } from 'next';

const shorten = (value?: string | null) =>
  value && value.length > 10 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value || 'anon';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const { prompt, walletAddress } = req.body as {
    prompt?: string;
    walletAddress?: string | null;
  };

  if (!prompt) {
    res.status(400).json({ message: 'Missing prompt' });
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, 350));

  const operator = shorten(walletAddress);
  const reply = `Ops shell ready for ${operator}.\n\n` +
    `• Lease/stop workloads with \'lease renew <id>\' or \'pause <id>\'.\n` +
    `• Request GPUs via \'scale gpu <region>\'. Heavy requests may trigger HTTP 402 challenges—inspect the Coinbase x402 headers and replay with the signed receipt.\n` +
    `• Current prompt: "${prompt}". I would translate that into orchestrator calls and report back once the action succeeds.`;

  res.status(200).json({ id: `assistant-${Date.now()}`, reply });
}
