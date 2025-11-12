// src/components/AddressDisplay.tsx
import type { FC } from 'react';
import { useState, useEffect } from 'react';
import type { BrowserProvider } from 'ethers';

interface AddressDisplayProps {
  address: string | undefined;
  provider: BrowserProvider | null;
}

export const AddressDisplay: FC<AddressDisplayProps> = ({ address, provider }) => {
  const [displayName, setDisplayName] = useState<string>('');

  useEffect(() => {
    const resolveEnsName = async () => {
      if (!address) {
        setDisplayName('Invalid Address');
        return;
      }
      
      const truncated = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
      setDisplayName(truncated);

      if (provider) {
        try {
          await provider.ready; 
          const name = await provider.lookupAddress(address);
          if (name) {
            setDisplayName(name);
          }
        } catch (error) {
          console.warn("Could not resolve ENS name:", error);
        }
      }
    };

    resolveEnsName();
  }, [address, provider]);

  return (
    <span className="font-mono" title={address}>
      {displayName}
    </span>
  );
};