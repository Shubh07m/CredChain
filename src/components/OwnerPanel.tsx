// src/components/OwnerPanel.tsx

import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { ethers, Contract, BrowserProvider } from 'ethers';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    <div className="w-full px-4 py-6">
      <div className="mx-auto w-full max-w-md sm:max-w-lg lg:max-w-2xl space-y-4">
      <Card className="w-full max-w-2xl md:max-w-3xl bg-black/60 backdrop-blur-2xl text-white border-white/10 shadow-xl">
      <CardHeader>
        <div className="flex justify-center items-center gap-2">
          <svg className="w-6 h-6 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <CardTitle>Admin Dashboard</CardTitle>
        </div>
        <CardDescription>
          Manage university addresses authorized to issue credentials.
        </CardDescription>
      </CardHeader>
      <CardContent>
      <form className="space-y-4" onSubmit={(e: FormEvent<HTMLFormElement>) => e.preventDefault()}>
        <div className="grid w-full items-center gap-4">
          <Label htmlFor="uniAddress">
            University Ethereum Address or ENS
          </Label>
          {/* <div className="mt-1 relative rounded-md shadow-sm"> */}
            <Input
              id="uniAddress"
              type="text"
              value={uniAddress}
              onChange={(e) => setUniAddress(e.target.value)}
              placeholder="0x... or university.eth"
            />
          {/* </div> */}
        </div>
        
        <div className="flex flex-col sm:flex-row sm:justify-center sm:items-center gap-3 w-full">
          <Button
            type="button" 
            onClick={() => handleTransaction('addUniversity')}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add University</span>
              </>
            )}
          </Button>
          
          <Button
            type="button"
            onClick={() => handleTransaction('removeUniversity')}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Remove University</span>
              </>
            )}
          </Button>
        </div>
      </form>
      </CardContent>
      <CardFooter className="flex justify-between">
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'success' && <CheckCircle className="h-4 w-4" />}
          {message.type === 'error' && <AlertCircle className="h-4 w-4" />}
          {message.type === 'info' && <Info className="h-4 w-4" />}
          <AlertTitle>
            {
              {
                success: 'Success',
                error: 'Error',
                info: 'Information',
              }[message.type]
            }
          </AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}
      </CardFooter>
      </Card>
      </div>
    </div>
  );
};