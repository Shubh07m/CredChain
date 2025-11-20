// src/components/SearchByStudentPanel.tsx
import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { ethers, BrowserProvider, Contract } from 'ethers';
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

interface SearchByStudentPanelProps {
  provider: BrowserProvider | null;
  contract: Contract | null;
}

export const SearchByStudentPanel: FC<SearchByStudentPanelProps> = ({ provider, contract }) => {
  const [studentAddress, setStudentAddress] = useState<string>('');
  const [searchedCredentials, setSearchedCredentials] = useState<ContractCredential[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchMessage, setSearchMessage] = useState<string>('');

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const addressToSearch = studentAddress.trim();
    if(!contract || !provider || !addressToSearch) {
      setSearchMessage("Please connect your wallet and enter a student address or ENS name.");
      return;
    }

    setIsSearching(true);
    setSearchedCredentials([]);
    setSearchMessage('');
    let resolvedAddress: string | null;

    try {
      if (ethers.isAddress(addressToSearch)) {
        resolvedAddress = addressToSearch;
      } else {
        setSearchMessage("Resolving ENS name...");
        resolvedAddress = await provider.resolveName(addressToSearch);
        if (!resolvedAddress) {
          throw new Error("Invalid address or unresolvable ENS name.");
        }
      }

      setSearchMessage("Fetching credential IDs...");
      const ids: bigint[] = await contract.getStudentCredentialIds(resolvedAddress);

      if (ids.length === 0) {
        setSearchMessage(`No credentials found for ${addressToSearch}.`);
      } else {
        setSearchMessage(`Found ${ids.length} credential(s). Fetching details...`);
        const creds: ContractCredential[] = await Promise.all(ids.map(id => contract.credentials(id)));
        setSearchedCredentials(creds);
        setSearchMessage(`${creds.length} credential(s) found for ${addressToSearch}.`);
      }
    } catch (err: any) {
      console.error("Error searching credentials:", err);
      setSearchMessage(err.reason || "An error occurred during the search.");
    }
    setIsSearching(false);
  };

  return (
    <div className="w-full px-4 py-6">
      <div className="mx-auto w-full max-w-md sm:max-w-lg lg:max-w-2xl space-y-4">
        <Card className="w-full max-w-2xl md:max-w-3xl bg-black/60 backdrop-blur-2xl text-white border-white/10 shadow-xl">
        <CardHeader>
          <CardTitle>
            Search Credentials by Student
          </CardTitle>
        </CardHeader>
        <CardContent>
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <div className="grid w-full items-center gap-4">        
        <Input
          type="text"
          value={studentAddress}
          onChange={(e) => setStudentAddress(e.target.value)}
          placeholder="Enter Student Address or ENS Name"
        />
        <Button
          type="submit"
          disabled={isSearching}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
        </div>
      </form>
      </CardContent>
      {/* <CardFooter className="flex justify-between"> */}
      <div className="mt-4">
        {searchMessage && !searchedCredentials.length && <p className="text-gray-600 mt-2 text-sm">{searchMessage}</p>}
        {searchedCredentials.length > 0 && (
          <>
            <p className="text-gray-600 mt-2 text-sm">{searchMessage}</p>
            <div>
              {searchedCredentials.map(cred => (
                <ContractCredentialCard
                  key={cred.id.toString()}
                  cred={cred}
                  isStudentView={true} // This is a public search view
                  provider={provider}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {/* </CardFooter> */}
      </Card>
      </div>
    </div>
  );
};