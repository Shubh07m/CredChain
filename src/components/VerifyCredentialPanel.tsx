// src/components/VerifyCredentialPanel.tsx
import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import type { BrowserProvider, Contract } from 'ethers';
import { ContractCredentialCard } from './ContractCredentialCard';
import type { ContractCredential } from './ContractCredentialCard';

interface VerifyCredentialPanelProps {
  provider: BrowserProvider | null;
  contract: Contract | null;
}

export const VerifyCredentialPanel: FC<VerifyCredentialPanelProps> = ({ provider, contract }) => {
  const [searchId, setSearchId] = useState<string>('');
  const [searchedCredential, setSearchedCredential] = useState<ContractCredential | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyMessage, setVerifyMessage] = useState<string>('');

  const handleVerify = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const idToVerify = searchId.trim();
    if(!contract || !idToVerify || !/^\d+$/.test(idToVerify)) { 
      setVerifyMessage("Please enter a valid Credential ID (numeric)."); 
      return; 
    }
    setIsVerifying(true); 
    setSearchedCredential(null); 
    setVerifyMessage('');
    try {
      const cred: ContractCredential = await contract.credentials(idToVerify);
      if (cred.issueDate.toString() === '0') { 
        setVerifyMessage(`Credential with ID #${idToVerify} was not found.`); 
      } else { 
        setSearchedCredential(cred); 
      }
    } catch (err: any) { 
      console.error("Error verifying credential:", err); 
      setVerifyMessage(err.reason || "An error occurred during verification."); 
    }
    setIsVerifying(false);
  };

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Verify a Credential by ID</h3>
      <form onSubmit={handleVerify} className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <input 
          type="text" 
          value={searchId} 
          onChange={(e) => setSearchId(e.target.value)} 
          placeholder="Enter Credential ID (e.g., 0)" 
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-blue-500 focus-visible:border-blue-500 text-red-800 focus:text-black-500" 
        />
        <button 
          type="submit" 
          disabled={isVerifying} 
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isVerifying ? 'Verifying...' : 'Verify'}
        </button>
      </form>
      <div className="mt-4">
        {searchedCredential && (
          <ContractCredentialCard 
            cred={searchedCredential} 
            isStudentView={false} 
            provider={provider} 
          />
        )}
        {verifyMessage && !searchedCredential && <p className="text-gray-600 mt-2 text-sm">{verifyMessage}</p>}
      </div>
    </div>
  );
};

