import { FormEvent, useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  walletAddress: string | null;
}

const initialMessage: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Fleet ops online. Ask me to renew leases, warm up containers, or request GPUs. I will translate your prompt into orchestrator actions and show when a 402 paywall triggers.',
};

const quickPrompts = [
  'renew lease vm-401',
  'pause container edge-latency',
  'scale gpu fra-1 2x',
];

export default function ChatPanel({ walletAddress }: Props) {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) {
      return;
    }
    const nextMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
    };

    const nextHistory = [...messages, nextMessage];
    setMessages(nextHistory);
    setInput('');
    setIsSending(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          prompt: nextMessage.content,
          history: nextHistory,
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.message || 'Chat backend failed');
      }

      const assistantMessage: Message = {
        id: body.id,
        role: 'assistant',
        content: body.reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setError('Unable to reach chat endpoint.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>OpenAI-style assistant</h2>
      <p style={{ color: '#cbd5f5' }}>
        {walletAddress
          ? `Connected operator: ${walletAddress}. Chat controls lease + compute flows.`
          : 'Connect a wallet to attribute lease changes and payments.'}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => setInput(prompt)}
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {prompt}
          </button>
        ))}
      </div>
      <div style={{
        maxHeight: '400px',
        overflowY: 'auto',
        background: 'rgba(0,0,0,0.35)',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
              background: message.role === 'user' ? 'rgba(125, 211, 252, 0.2)' : 'rgba(167, 243, 208, 0.2)',
              padding: '0.75rem',
              borderRadius: '12px',
              maxWidth: '85%',
            }}
          >
            <strong style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              {message.role === 'user' ? walletAddress || 'You' : 'x402 copilot'}
            </strong>
            <span style={{ whiteSpace: 'pre-wrap' }}>{message.content}</span>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask how to satisfy a 402 challenge, or how wallets interact with x402…"
        />
        <button type="submit" disabled={isSending}>
          {isSending ? 'Thinking…' : 'Send message'}
        </button>
      </form>

      {error && <p style={{ color: '#fecaca' }}>{error}</p>}
    </div>
  );
}
