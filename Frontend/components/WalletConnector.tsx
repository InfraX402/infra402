import { useCallback, useEffect, useState } from 'react';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<any>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
    };
  }
}

interface WalletConnectorProps {
  walletAddress: string | null;
  chainId: string | null;
  onConnect: (address: string, chainId: string) => void;
  onDisconnect: () => void;
}

const formatAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;

export default function WalletConnector({ walletAddress, chainId, onConnect, onDisconnect }: WalletConnectorProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('No EIP-1193 wallet detected. Install MetaMask or Coinbase Wallet.');
      return;
    }

    try {
      setError(null);
      setIsConnecting(true);
      const accounts = (await window.ethereum.request({ method: 'eth_requestAccounts' })) as string[];
      const nextAddress = accounts?.[0];
      const nextChainId = (await window.ethereum.request({ method: 'eth_chainId' })) as string;

      if (nextAddress) {
        onConnect(nextAddress, nextChainId);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to connect wallet. Check the extension pop-up.');
    } finally {
      setIsConnecting(false);
    }
  }, [onConnect]);

  const disconnect = useCallback(() => {
    setError(null);
    onDisconnect();
  }, [onDisconnect]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) {
      return;
    }

    const handleAccountsChanged = async (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        disconnect();
        return;
      }
      const nextChainId = (await window.ethereum?.request({
        method: 'eth_chainId',
      })) as string;
      onConnect(accounts[0], nextChainId || chainId || '');
    };

    const handleChainChanged = (nextChainId: string) => {
      if (walletAddress) {
        onConnect(walletAddress, nextChainId);
      }
    };

    window.ethereum.on?.('accountsChanged', handleAccountsChanged);
    window.ethereum.on?.('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [chainId, disconnect, onConnect, walletAddress]);

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Wallet authentication</h2>
      <p style={{ color: '#b5c0ff', minHeight: '3rem' }}>
        {walletAddress ? (
          <>
            Connected to <strong>{formatAddress(walletAddress)}</strong>
            {chainId ? ` on chain ${parseInt(chainId, 16)}` : ''}
          </>
        ) : (
          'Connect an EIP-1193 compatible wallet to continue'
        )}
      </p>

      {walletAddress ? (
        <button onClick={disconnect}>Disconnect</button>
      ) : (
        <button onClick={connect} disabled={isConnecting}>
          {isConnecting ? 'Connecting…' : 'Connect wallet'}
        </button>
      )}

      {window.ethereum && (
        <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#7dd3fc' }}>
          {window.ethereum.isCoinbaseWallet
            ? 'Coinbase Wallet detected'
            : window.ethereum.isMetaMask
            ? 'MetaMask detected'
            : 'Generic EIP-1193 provider detected'}
        </p>
      )}

      {error && (
        <p style={{ color: '#ff9b9b', fontSize: '0.9rem', marginTop: '0.75rem' }}>
          {error}
        </p>
      )}
    </div>
  );
}
