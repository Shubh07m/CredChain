import { useState, useEffect }from 'react';
import type { Eip1193Provider } from 'ethers';
import type { BrowserProvider, Contract, Signer, InterfaceAbi } from 'ethers';
import { ethers } from 'ethers';
import './App.css';

// --- IMPORT YOUR NEW COMPONENTS ---
import { OwnerPanel } from './components/OwnerPanel';
import { UniversityPanel } from './components/UniversityPanel';
import { StudentVerifierView } from './components/StudentVerifierView';
import { VerifyCredentialPanel } from './components/VerifyCredentialPanel';
import { SearchByStudentPanel } from './components/SearchByStudentPanel';
import { RoleIndicator } from './components/navigation';
import { AddressDisplay } from './components/AddressDisplay';

// --- Type Definitions ---
interface Eip6963Provider extends Eip1193Provider {
  isMetaMask?: boolean;
  on(eventName: string | symbol, listener: (...args: any[]) => void): this;
  removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
}
declare global {
  interface Window {
    ethereum?: Eip6963Provider & {
      providers?: Eip6963Provider[];
    };
  }
}

// --- ABI AND CONSTANTS ---
const contractAddress: string = import.meta.env.VITE_CONTRACT_ADDRESS;
const PINATA_JWT: string = import.meta.env.VITE_PINATA_JWT;
const contractABI: InterfaceAbi = 
[
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_universityAddress",
				"type": "address"
			}
		],
		"name": "addUniversity",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "credentialId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "studentAddress",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "universityAddress",
				"type": "address"
			}
		],
		"name": "CredentialIssued",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "credentialId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "universityAddress",
				"type": "address"
			}
		],
		"name": "CredentialRevoked",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_studentAddress",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_credentialType",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_ipfsHash",
				"type": "string"
			}
		],
		"name": "issueCredential",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_universityAddress",
				"type": "address"
			}
		],
		"name": "removeUniversity",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_credentialId",
				"type": "uint256"
			}
		],
		"name": "revokeCredential",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "universityAddress",
				"type": "address"
			}
		],
		"name": "UniversityAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "universityAddress",
				"type": "address"
			}
		],
		"name": "UniversityRemoved",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "credentials",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "studentAddress",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "universityAddress",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "credentialType",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "ipfsHash",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "issueDate",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isValid",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_credentialId",
				"type": "uint256"
			}
		],
		"name": "getCredentialDetails",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "studentAddress",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "universityAddress",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "credentialType",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "ipfsHash",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "issueDate",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "isValid",
						"type": "bool"
					}
				],
				"internalType": "struct VeriCred.Credential",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_studentAddress",
				"type": "address"
			}
		],
		"name": "getStudentCredentialIds",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "isUniversity",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "studentCredentials",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isUniversity, setIsUniversity] = useState<boolean>(false);
  const [networkError, setNetworkError] = useState<string>('');

  const connectWallet = async () => {
    setNetworkError('');
    if (typeof window.ethereum === 'undefined') {
      setNetworkError("Please install MetaMask or another web3 wallet.");
      return;
    }
    
    try {
      let web3Provider: BrowserProvider;
      if (window.ethereum.providers?.length) {
        const mmProvider = window.ethereum.providers.find(p => p.isMetaMask);
        web3Provider = new ethers.BrowserProvider(mmProvider || window.ethereum.providers[0]);
      } else {
        web3Provider = new ethers.BrowserProvider(window.ethereum);
      }
      setProvider(web3Provider);
      
      const accounts = await web3Provider.send("eth_requestAccounts", []);
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please unlock your wallet.");
      }
      const signer: Signer = await web3Provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);

      try {
        await web3Provider.getNetwork(); 
      } catch (netError) {
        console.error("Network connection error:", netError);
        setNetworkError("Could not connect to the blockchain network. Check your wallet's network.");
        setContract(null);
        return;
      }

      const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
      setContract(contractInstance);
      
      checkUserRole(address, contractInstance);
    } catch (err: any) {
      console.error("Error connecting wallet:", err);
      if (err.code === 4001) {
        setNetworkError("Wallet connection rejected.");
      } else {
        setNetworkError(`Error connecting wallet: ${err.message}`);
      }
      setAccount(null);
      setContract(null);
    }
  };



  const checkUserRole = async (currentAccount: string, currentContract: Contract) => {
    if (!currentContract || !currentAccount) return;

    // Reset roles to prevent stale state from a previous user.
    setIsOwner(false);
    setIsUniversity(false);

    try {
      // --- CORRECTED LOGIC ---
      // Check for Owner status
      const ownerAddress = await currentContract.owner();
      const newIsOwner = currentAccount.toLowerCase() === ownerAddress.toLowerCase();
      setIsOwner(newIsOwner);
      
      // Check for University status (independently, not in an 'else' block)
      const universityStatus = await currentContract.isUniversity(currentAccount);
      setIsUniversity(universityStatus);
      // --- END CORRECTION ---
      
    } catch(err: any) {
        console.error("Error checking user role:", err);
         if (err.code === 'CALL_EXCEPTION') {
            setNetworkError("Error reading from contract. Are you on the correct network?");
         } else {
            setNetworkError("Could not determine user role.");
         }
         // Ensure we are fully reset on error
         setIsOwner(false);
         setIsUniversity(false);
    }
  };

  

  useEffect(() => {
    let providerInstance: Eip6963Provider | null = null;
    if (typeof window.ethereum !== 'undefined') {
      if (window.ethereum.providers?.length) {
        providerInstance = window.ethereum.providers.find(p => p.isMetaMask) || window.ethereum.providers[0];
      } else {
        providerInstance = window.ethereum;
      }

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          connectWallet(); 
        } else {
          setAccount(null);
          setProvider(null);
          setContract(null);
          setIsOwner(false);
          setIsUniversity(false);
          setNetworkError("Wallet disconnected.");
        }
      };

      const handleChainChanged = (chainId: string) => {
        console.log("Network changed to:", chainId);
        window.location.reload(); 
      };

      providerInstance.on('accountsChanged', handleAccountsChanged);
      providerInstance.on('chainChanged', handleChainChanged);

      connectWallet(); // Initial connect attempt

      return () => {
        providerInstance?.removeListener?.('accountsChanged', handleAccountsChanged);
        providerInstance?.removeListener?.('chainChanged', handleChainChanged);
      };
    } else {
      console.log("No web3 wallet detected on initial load.");
    }
  }, []); // Run only once on component mount

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-white shadow">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-800">
            Cred<span className="text-blue-600">Chain</span>
          </div>
          <div className="flex items-center gap-4">
            {account && (
              <RoleIndicator isOwner={isOwner} isUniversity={isUniversity} />
            )}
            {account ? (
              <div className="bg-gray-200 text-gray-700 text-sm font-semibold py-2 px-4 rounded-full">
                <AddressDisplay address={account} provider={provider} />
              </div>
            ) : (
              <button 
                onClick={connectWallet}
                className="bg-blue-600 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700 transition duration-300 disabled:opacity-50"
                disabled={!!networkError && !account}
              >
                Connect Wallet
              </button>
            )}
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                A New Standard in <span className="text-blue-600">Academic Verification</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Securely issue, manage, and verify academic credentials on the blockchain.
            </p>
        </div>

        {networkError && (
          <div className="mb-8 text-center bg-red-100 text-red-800 p-4 rounded-lg shadow-md">
            {networkError}
          </div>
        )}

        {!account && !networkError && (
          <div className="text-center bg-yellow-100 text-yellow-800 p-4 rounded-lg shadow-md">
              Please connect your wallet to access your portal.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* === Main Content (2/3 width) === */}
          <div className="lg:col-span-2 space-y-8">
            {/* --- Render Role-Specific Panels --- */}
            {isOwner && (
              <OwnerPanel contract={contract} provider={provider} />
            )}
            
            {isUniversity && (
              <UniversityPanel contract={contract} provider={provider} PINATA_JWT={PINATA_JWT} />
            )}
            
            {/* --- Render Student Panel (with tabs) --- */}
            {account && !isOwner && !isUniversity && (
              <StudentVerifierView 
                contract={contract} 
                account={account} 
                provider={provider} 
              />
            )}
          </div>

          {/* === Sidebar (1/3 width) === */}
          <div className="space-y-8">
            {/* --- Always show Public Verification Panels --- */}
            <VerifyCredentialPanel provider={provider} contract={contract} /> 
            <SearchByStudentPanel provider={provider} contract={contract} />
          </div>

        </div>
      </main>
       <footer className="text-center py-6 mt-12 text-sm text-gray-500 border-t">
            CredChain - Decentralized Credential Verification
       </footer>
    </div>
  );
}

export default App;