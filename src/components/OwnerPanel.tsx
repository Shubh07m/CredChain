// src/components/OwnerPanel.tsx

import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { ethers, Contract, BrowserProvider } from 'ethers';
import { LoadingSpinner, AlertBox } from './ui'; // Assuming ui.tsx

// Define a reusable Message type
interface Message {
  type: 'success' | 'error' | 'info';
  text: string;
}

// Define props
interface OwnerPanelProps {
  contract: Contract | null;
  provider: BrowserProvider | null;
}

// List of chain IDs (as BigInts) that are known to support ENS
const ENS_SUPPORTED_CHAINS = [
  1n,       // Ethereum Mainnet
  5n,       // Goerli
  11155111n, // Sepolia
];

export const OwnerPanel: FC<OwnerPanelProps> = ({ contract, provider }) => {
  const [uniAddress, setUniAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<Message | null>(null);

  const handleTransaction = async (action: 'addUniversity' | 'removeUniversity') => {
    setMessage(null);
    if (!contract || !provider) {
      setMessage({ type: 'error', text: 'Contract or provider not initialized.' });
      return;
    }

    // --- NEW, EFFICIENT FIX ---
    // Get the network info *once* at the start.
    const network = await provider.getNetwork();
    const canUseENS = ENS_SUPPORTED_CHAINS.includes(network.chainId);
    // --- END NEW FIX ---

    let normalizedAddress: string | null = null;

    // --- GUARD 1: Input Validation ---
    if (ethers.isAddress(uniAddress)) {
      normalizedAddress = uniAddress;
    } else {
      // It's not an address, so it might be an ENS name.
      // We check our new boolean.
      if (!canUseENS) {
        // We are on a local network (like 1337) that doesn't support ENS.
        setMessage({ 
          type: 'error', 
          text: `Network (chainId: ${network.chainId}) does not support ENS. Please enter a full 0x... address.` 
        });
        return;
      }

      // If we're here, we can safely try to resolve the name.
      try {
        setMessage({ type: 'info', text: 'Resolving ENS name...' });
        normalizedAddress = await provider.resolveName(uniAddress);
        if (!normalizedAddress) {
          throw new Error("Invalid address or unresolvable ENS name");
        }
      } catch (err) {
        console.warn("Could not resolve ENS name or invalid address:", err);
        setMessage({ type: 'error', text: 'Please enter a valid Ethereum address or a resolvable ENS name.' });
        return;
      }
    }
    // --- END GUARD 1 ---

    setIsLoading(true);
    setMessage({ type: 'info', text: 'Submitting transaction... Please confirm in your wallet.' });
    try {
      const tx = await contract[action](normalizedAddress);
      setMessage({ type: 'info', text: 'Transaction submitted. Waiting for confirmation...' });
      await tx.wait();
      
      // --- GUARD 2: Success Message Lookup ---
      let displayAddress: string;
      const truncatedAddress = normalizedAddress.substring(0, 6) + '...' + normalizedAddress.substring(normalizedAddress.length - 4);
      
      // We check our boolean again!
      if (canUseENS) {
        // We're on a real network, try the reverse lookup
        displayAddress = await provider.lookupAddress(normalizedAddress) || truncatedAddress;
      } else {
        // We're on a local network, just use the truncated address
        displayAddress = truncatedAddress;
      }
      // --- END GUARD 2 ---
      
      setMessage({ type: 'success', text: `University ${displayAddress} ${action === 'addUniversity' ? 'added' : 'removed'} successfully!` });
      setUniAddress('');
    } catch (err: any) {
      console.error(`Error with ${action}:`, err);
      setMessage({ type: 'error', text: err.reason || 'Transaction failed. Please check console for details.' });
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm space-y-6">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
      </div>
      
      <form className="space-y-4" onSubmit={(e: FormEvent<HTMLFormElement>) => e.preventDefault()}>
        <div>
          <label htmlFor="uniAddress" className="block text-sm font-medium text-gray-700 mb-1">
            University Ethereum Address or ENS
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              id="uniAddress"
              type="text"
              value={uniAddress}
              onChange={(e) => setUniAddress(e.target.value)}
              placeholder="0x... or university.eth"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-red-800 focus:text-black-500"
            />
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            type="button" 
            onClick={() => handleTransaction('addUniversity')}
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex justify-center items-center space-x-2"
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add University</span>
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => handleTransaction('removeUniversity')}
            disabled={isLoading}
            className="flex-1 bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex justify-center items-center space-x-2"
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Remove University</span>
              </>
            )}
          </button>
        </div>
      </form>

      {message && (
        <AlertBox 
          type={message.type} 
          message={message.text} 
          onClose={() => setMessage(null)} 
        />
      )}
    </div>
  );
};