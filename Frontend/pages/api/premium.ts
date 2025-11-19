import type { NextApiRequest, NextApiResponse } from 'next';

const backendUrl = process.env.X402_BACKEND_URL || 'http://localhost:4021/premium/content';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const action =
    (typeof req.body === 'object' && req.body && 'action' in req.body ? String(req.body.action) : undefined) ||
    String(req.query.action || '') ||
    'inspect-lease';
  const operator =
    (typeof req.body === 'object' && req.body && 'walletAddress' in req.body ? String(req.body.walletAddress) : '') ||
    'anonymous';
  const upstreamUrl = backendUrl.includes('?')
    ? `${backendUrl}&action=${encodeURIComponent(action)}`
    : `${backendUrl}?action=${encodeURIComponent(action)}`;

  try {
    const upstream = await fetch(upstreamUrl);
    const text = await upstream.text();

    if (upstream.status === 402) {
      const challengeHeader = upstream.headers.get('www-authenticate') || '';
      if (challengeHeader) {
        res.setHeader('WWW-Authenticate', challengeHeader);
      }
      res.status(402).json({ message: `HTTP 402 Payment Required for ${action} (${operator})`, body: text });
      return;
    }

    if (!upstream.ok) {
      res.status(upstream.status).json({ message: `Upstream error ${upstream.status}`, body: text });
      return;
    }

    res.status(200).json({ message: `Action ${action} executed for ${operator}.`, body: text });
  } catch (error) {
    console.error('premium proxy failed', error);
    res.status(500).json({ message: 'Unable to reach x402 backend. Start FastAPI on :4021.' });
  }
}
