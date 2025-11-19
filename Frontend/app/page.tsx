'use client';

import { useState } from 'react';
import ChatPanel from '../components/ChatPanel';
import ComputeConsole from '../components/ComputeConsole';
import MiniAppStatus from '../components/MiniAppStatus';
import ResourceList from '../components/ResourceList';
import WalletConnector from '../components/WalletConnector';

export default function HomePage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);

  return (
    <main>
      <header style={{ marginBottom: '2rem' }}>
        <p style={{ textTransform: 'uppercase', letterSpacing: '0.2em', color: '#95a7ff' }}>
          Prototype · Coinbase x402 · Web3
        </p>
        <h1 style={{ fontSize: '2.75rem', marginBottom: '0.5rem' }}>
          Wallet-authenticated control plane for compute leases
        </h1>
        <p style={{ maxWidth: '800px', color: '#cbd5f5' }}>
          Connect an EIP-1193 wallet, boot a Farcaster Mini App-compatible UI, chat with the orchestration copilot, and
          trigger VM/container operations. Expensive requests (lease renewals, GPU bursts) surface Coinbase x402
          challenges as HTTP 402 responses.
        </p>
        <MiniAppStatus />
      </header>

      <div
        className="grid"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}
      >
        <section>
          <WalletConnector
            walletAddress={walletAddress}
            chainId={chainId}
            onConnect={(address, chain) => {
              setWalletAddress(address);
              setChainId(chain);
            }}
            onDisconnect={() => {
              setWalletAddress(null);
              setChainId(null);
            }}
          />
        </section>

        <section>
          <ComputeConsole walletAddress={walletAddress} />
        </section>

        <section>
          <ResourceList walletAddress={walletAddress} />
        </section>
      </div>

      <section style={{ marginTop: '2rem' }}>
        <ChatPanel walletAddress={walletAddress} />
      </section>
    </main>
  );
}
