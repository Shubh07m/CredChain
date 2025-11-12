// src/components/ContractCredentialCard.tsx
import type { FC } from 'react';
import type { BrowserProvider } from 'ethers';
import { useEffect, useState } from 'react'; // Imports are correct

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
  const [isCopied, setIsCopied] = useState(false);
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
    <div className="font-main bg-gray-50 border p-4 rounded-lg shadow-sm space-y-2 break-inside-avoid">
      
      {/* --- MODIFIED --- ID display with Copy button */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 font-mono" title={credIdString}>
          ID: {truncatedId}
        </p>
        <button 
          onClick={handleCopyId} 
          className="text-gray-400 hover:text-blue-600 p-1 -m-1" // Button with small padding
          title="Copy full ID"
        >
          {isCopied ? (
            <span className="text-xs font-medium text-blue-600">Copied!</span>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>
      {/* --- END MODIFICATION --- */}

      <p className="font-bold text-blue-600 break-words">{cred.credentialType}</p>
      <p className="text-sm text-gray-500 break-words">
        Issued by: <AddressDisplay address={cred.universityAddress} provider={provider} />
      </p>
      {!isStudentView && (
        <p className="text-sm text-gray-500 break-words">
          Issued to: <AddressDisplay address={cred.studentAddress} provider={provider} />
        </p>
      )}
      <p className={`text-sm font-semibold ${cred.isValid ? 'text-green-600' : 'text-red-600'}`}>
        Status: {cred.isValid ? 'Valid' : 'Revoked'}
      </p>
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
        <button 
          onClick={() => handleDraftPost(cred.credentialType)} 
          disabled={isDrafting} 
          className="text-xs bg-indigo-100 text-indigo-700 font-semibold py-1 px-3 rounded-full hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {isDrafting ? 'Drafting...' : '✨ Draft Announcement'}
        </button>
      )}
    </div>
  );
};