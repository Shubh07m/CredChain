// src/components/VerifyCredentialPanel.tsx
import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import type { BrowserProvider, Contract } from 'ethers';
import { ContractCredentialCard } from './ContractCredentialCard';
import type { ContractCredential } from './ContractCredentialCard';
import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

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
    <div className="w-full px-4 py-6">
      <div className="mx-auto w-full max-w-md sm:max-w-lg lg:max-w-2xl space-y-4">
        <Card className="w-full max-w-2xl md:max-w-3xl bg-black/60 backdrop-blur-2xl text-white border-white/10 shadow-xl">
        <CardHeader>
          <CardTitle>
            Verify a Credential by ID
          </CardTitle>
        </CardHeader>
        <CardContent>      
          <form onSubmit={handleVerify} className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="grid w-full items-center gap-4">
        <Input 
          type="text" 
          value={searchId} 
          onChange={(e) => setSearchId(e.target.value)} 
          placeholder="Enter Credential ID (e.g., 0)" 
        />
        <Button 
          type="submit" 
          disabled={isVerifying} 
        >
          {isVerifying ? 'Verifying...' : 'Verify'}
        </Button>
        </div>
      </form>
      </CardContent>
      <div className="mt-4">
        {searchedCredential && (
          <ContractCredentialCard 
            cred={searchedCredential} 
            isStudentView={true} 
            provider={provider} 
          />
        )}
        {verifyMessage && !searchedCredential && <p className="text-gray-600 mt-2 text-sm">{verifyMessage}</p>}
      </div>
      </Card>
      </div>
      </div>
  );
};

