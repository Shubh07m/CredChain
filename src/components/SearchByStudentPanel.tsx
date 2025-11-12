// src/components/SearchByStudentPanel.tsx
import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { ethers, BrowserProvider, Contract } from 'ethers';
import { ContractCredentialCard } from './ContractCredentialCard';
import type { ContractCredential } from './ContractCredentialCard';

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
    <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Search Credentials by Student</h3>
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <input
          type="text"
          value={studentAddress}
          onChange={(e) => setStudentAddress(e.target.value)}
          placeholder="Enter Student Address or ENS Name"
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-blue-500 focus-visible:border-blue-500 text-red-800 focus:text-black-500"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>
      <div className="mt-4">
        {searchMessage && !searchedCredentials.length && <p className="text-gray-600 mt-2 text-sm">{searchMessage}</p>}
        {searchedCredentials.length > 0 && (
          <>
            <p className="text-gray-700 mt-2 text-sm mb-4">{searchMessage}</p>
            <div className="columns-1 md:columns-2 gap-4">
              {searchedCredentials.map(cred => (
                <ContractCredentialCard
                  key={cred.id.toString()}
                  cred={cred}
                  isStudentView={false} // This is a public search view
                  provider={provider}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};