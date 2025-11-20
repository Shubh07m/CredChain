// src/components/ContractCredentialCard.tsx
import type { FC } from 'react';
import type { BrowserProvider } from 'ethers';
import { useEffect, useState } from 'react'; // Imports are correct
import { CopyButton } from './ui/shadcn-io/copy-button';
import { Button } from "./ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// --- This is the data structure from your CONTRACT ---
export interface ContractCredential {
  id: bigint;
  studentAddress: string;
  universityAddress: string;
  credentialType: string;
  ipfsHash: string;
  issueDate: bigint;
  isValid: boolean;
}

// --- A simple AddressDisplay component for ENS ---
const AddressDisplay: FC<{ address: string, provider: BrowserProvider | null }> = ({ address, provider }) => {
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    const resolveEnsName = async () => {
      const truncated = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
      setDisplayName(truncated); // Set truncated name first
      
      if (provider) {
        try {
          const name = await provider.lookupAddress(address);
          if (name) {
            setDisplayName(name); // Set ENS name if found
          }
        } catch (error) {
          console.warn("Could not resolve ENS name:", error);
          // Keep truncated name
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

// --- Props for the Card ---
interface ContractCredentialCardProps {
  cred: ContractCredential;
  isStudentView: boolean;
  provider: BrowserProvider | null;
  handleDraftPost?: (credentialType: string) => void;
  isDrafting?: boolean;
}

export const ContractCredentialCard: FC<ContractCredentialCardProps> = ({ 
  cred, 
  isStudentView, 
  provider,
  handleDraftPost,
  isDrafting
}) => {
  const [, setIsCopied] = useState(false);
  const credIdString = cred.id.toString();

  // --- NEW --- Truncate the ID
  const truncatedId = credIdString.length > 10 
    ? `${credIdString.substring(0, 6)}...${credIdString.substring(credIdString.length - 4)}` 
    : credIdString;

  // --- NEW --- Copy handler
  const handleCopyId = () => {
    navigator.clipboard.writeText(credIdString).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <div className="px-1 py-2">
      <div className="h-full mx-auto sm:max-w-lg lg:max-w-2xl space-y-4">
        <Card className="h-full flex flex-col bg-black/60 backdrop-blur-2xl text-white border-white/10 shadow-xl">
        <CardHeader>
          <CardTitle>
            Credential(s) Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
        <Label title={credIdString}>
          ID: {truncatedId}
        </Label>
        {/* <button 
          onClick={handleCopyId} 
          className="text-gray-400 hover:text-blue-600 p-1 -m-1" // Button with small padding
          title="Copy full ID"
        >
          {isCopied(
            <span className="text-xs font-medium text-blue-600">Copied!</span>
          )}
        </button> */}
        <CopyButton
        onClick={handleCopyId} 
        variant="default" size="md" 
        />
        </div>
      
      {/* --- END MODIFICATION --- */}

      <p>{cred.credentialType}</p>
      <CardDescription>
        Issued by: <AddressDisplay address={cred.universityAddress} provider={provider} />
      </CardDescription>
      {isStudentView && (
        <p>
          Issued to: <AddressDisplay address={cred.studentAddress} provider={provider} />
        </p>
      )}
      <CardDescription className={`text-sm ${cred.isValid ? 'text-green-600' : 'text-red-600'}`}>
        Status: {cred.isValid ? 'Valid' : 'Revoked'}
      </CardDescription>
      {cred.ipfsHash && (
        <a 
          href={`https://gateway.pinata.cloud/ipfs/${cred.ipfsHash}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-500 hover:underline text-xs block break-all"
        >
          View Document (IPFS)
        </a>
      )}
      

      {isStudentView && handleDraftPost && (
        <Button 
        onClick={() => handleDraftPost(cred.credentialType)} 
        disabled={isDrafting}
        size={'sm'} 
        >
          {isDrafting ? 'Drafting...' : '✨ Draft Announcement'}
        </Button>
      )}
      </CardContent>
      </Card>
      </div>
    </div>
  );
};