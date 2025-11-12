// // app.tsx

// import React, { useState, useEffect } from 'react';
// // Use type-only imports for React types
// import type { FC, FormEvent, ChangeEvent } from 'react';
// import { ethers, BrowserProvider, Contract } from 'ethers';
// // Use type-only imports for ethers types
// import type { Signer, Eip1193Provider, InterfaceAbi, DeferredTopicFilter } from 'ethers';
// import './App.css'

// // --- Type Definitions ---

// // Define the provider structure for EIP-6963 (multi-wallet support)
// interface Eip6963Provider extends Eip1193Provider {
//   isMetaMask?: boolean;
//   // Add missing event emitter methods
//   on(eventName: string | symbol, listener: (...args: any[]) => void): this;
//   removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
// }

// // Extend the global Window interface to include web3 providers
// declare global {
//   interface Window {
//     ethereum?: Eip6963Provider & {
//       providers?: Eip6963Provider[];
//     };
//   }
// }

// // Interface for the Credential struct from the smart contract
// interface Credential {
//   id: bigint;
//   studentAddress: string;
//   universityAddress: string;
//   credentialType: string;
//   ipfsHash: string;
//   issueDate: bigint;
//   isValid: boolean;
// }

// // Interface for UI messages (success, error, info)
// interface Message {
//   type: 'success' | 'error' | 'info';
//   text: string;
// }


// // --- IMPORTANT ---
// // 1. Paste your Deployed Smart Contract Address here
// const contractAddress: string = import.meta.env.VITE_CONTRACT_ADDRESS;
// const PINATA_JWT: string = import.meta.env.VITE_PINATA_JWT;

// // The ABI for the smart contract, typed as InterfaceAbi
// const contractABI: InterfaceAbi = [
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "_universityAddress",
// 				"type": "address"
// 			}
// 		],
// 		"name": "addUniversity",
// 		"outputs": [],
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [],
// 		"stateMutability": "nonpayable",
// 		"type": "constructor"
// 	},
// 	{
// 		"anonymous": false,
// 		"inputs": [
// 			{
// 				"indexed": true,
// 				"internalType": "uint256",
// 				"name": "credentialId",
// 				"type": "uint256"
// 			},
// 			{
// 				"indexed": true,
// 				"internalType": "address",
// 				"name": "studentAddress",
// 				"type": "address"
// 			},
// 			{
// 				"indexed": true,
// 				"internalType": "address",
// 				"name": "universityAddress",
// 				"type": "address"
// 			}
// 		],
// 		"name": "CredentialIssued",
// 		"type": "event"
// 	},
// 	{
// 		"anonymous": false,
// 		"inputs": [
// 			{
// 				"indexed": true,
// 				"internalType": "uint256",
// 				"name": "credentialId",
// 				"type": "uint256"
// 			},
// 			{
// 				"indexed": true,
// 				"internalType": "address",
// 				"name": "universityAddress",
// 				"type": "address"
// 			}
// 		],
// 		"name": "CredentialRevoked",
// 		"type": "event"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "_studentAddress",
// 				"type": "address"
// 			},
// 			{
// 				"internalType": "string",
// 				"name": "_credentialType",
// 				"type": "string"
// 			},
// 			{
// 				"internalType": "string",
// 				"name": "_ipfsHash",
// 				"type": "string"
// 			}
// 		],
// 		"name": "issueCredential",
// 		"outputs": [],
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "_universityAddress",
// 				"type": "address"
// 			}
// 		],
// 		"name": "removeUniversity",
// 		"outputs": [],
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "_credentialId",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "revokeCredential",
// 		"outputs": [],
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	},
// 	{
// 		"anonymous": false,
// 		"inputs": [
// 			{
// 				"indexed": true,
// 				"internalType": "address",
// 				"name": "universityAddress",
// 				"type": "address"
// 			}
// 		],
// 		"name": "UniversityAdded",
// 		"type": "event"
// 	},
// 	{
// 		"anonymous": false,
// 		"inputs": [
// 			{
// 				"indexed": true,
// 				"internalType": "address",
// 				"name": "universityAddress",
// 				"type": "address"
// 			}
// 		],
// 		"name": "UniversityRemoved",
// 		"type": "event"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "credentials",
// 		"outputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "id",
// 				"type": "uint256"
// 			},
// 			{
// 				"internalType": "address",
// 				"name": "studentAddress",
// 				"type": "address"
// 			},
// 			{
// 				"internalType": "address",
// 				"name": "universityAddress",
// 				"type": "address"
// 			},
// 			{
// 				"internalType": "string",
// 				"name": "credentialType",
// 				"type": "string"
// 			},
// 			{
// 				"internalType": "string",
// 				"name": "ipfsHash",
// 				"type": "string"
// 			},
// 			{
// 				"internalType": "uint256",
// 				"name": "issueDate",
// 				"type": "uint256"
// 			},
// 			{
// 				"internalType": "bool",
// 				"name": "isValid",
// 				"type": "bool"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "_credentialId",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "getCredentialDetails",
// 		"outputs": [
// 			{
// 				"components": [
// 					{
// 						"internalType": "uint256",
// 						"name": "id",
// 						"type": "uint256"
// 					},
// 					{
// 						"internalType": "address",
// 						"name": "studentAddress",
// 						"type": "address"
// 					},
// 					{
// 						"internalType": "address",
// 						"name": "universityAddress",
// 						"type": "address"
// 					},
// 					{
// 						"internalType": "string",
// 						"name": "credentialType",
// 						"type": "string"
// 					},
// 					{
// 						"internalType": "string",
// 						"name": "ipfsHash",
// 						"type": "string"
// 					},
// 					{
// 						"internalType": "uint256",
// 						"name": "issueDate",
// 						"type": "uint256"
// 					},
// 					{
// 						"internalType": "bool",
// 						"name": "isValid",
// 						"type": "bool"
// 					}
// 				],
// 				"internalType": "struct VeriCred.Credential",
// 				"name": "",
// 				"type": "tuple"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "_studentAddress",
// 				"type": "address"
// 			}
// 		],
// 		"name": "getStudentCredentialIds",
// 		"outputs": [
// 			{
// 				"internalType": "uint256[]",
// 				"name": "",
// 				"type": "uint256[]"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "",
// 				"type": "address"
// 			}
// 		],
// 		"name": "isUniversity",
// 		"outputs": [
// 			{
// 				"internalType": "bool",
// 				"name": "",
// 				"type": "bool"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [],
// 		"name": "owner",
// 		"outputs": [
// 			{
// 				"internalType": "address",
// 				"name": "",
// 				"type": "address"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "",
// 				"type": "address"
// 			},
// 			{
// 				"internalType": "uint256",
// 				"name": "",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "studentCredentials",
// 		"outputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "",
// 				"type": "uint256"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	}
// ];



// // --- Gemini API Helper Function ---
// async function callGeminiAPI(prompt: string): Promise<string> {
//     const apiKey = ""; // Per instructions, leave empty.
//     // Use the latest flash model
//     const apiUrl = `https://generativelang-googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`; 

//     const payload = {
//         contents: [{ parts: [{ text: prompt }] }],
//     };

//     // Define response structure for better typing
//     interface GeminiResponse {
//       candidates?: Array<{
//         content?: {
//           parts?: Array<{ text: string }>;
//         };
//       }>;
//       error?: { message: string };
//     }
    
//     interface GeminiErrorResponse {
//       error?: { message?: string };
//     }


//     // Implement exponential backoff for API calls
//     let attempts = 0;
//     const maxAttempts = 5;
//     const initialDelay = 1000; // 1 second

//     while (attempts < maxAttempts) {
//         try {
//             const response = await fetch(apiUrl, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payload)
//             });

//             if (!response.ok) {
//                 // If throttled (429), wait and retry
//                 if (response.status === 429) {
//                     throw new Error(`API Throttled (429)`);
//                 }
//                 const errorBody: GeminiErrorResponse = await response.json();
//                 throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody?.error?.message || 'Unknown API error'}`);
//             }

//             const result: GeminiResponse = await response.json();
//             const candidate = result.candidates?.[0];
            
//             if (candidate && candidate.content?.parts?.[0]?.text) {
//                 return candidate.content.parts[0].text;
//             } else {
//                 // Handle cases where response structure is unexpected but not an error
//                 console.warn("Gemini API response structure unexpected:", result);
//                 throw new Error("Invalid response structure from Gemini API.");
//             }
//         } catch (error: unknown) {
//             attempts++;
//             const errorMessage = (error instanceof Error) ? error.message : String(error);
//             console.warn(`Gemini API call attempt ${attempts} failed: ${errorMessage}`);
            
//             if (attempts >= maxAttempts || (error instanceof Error && error.message.includes('API Error'))) {
//                  console.error("Gemini API call failed after multiple attempts:", error);
//                  return `Error: Could not generate content. ${errorMessage}`;
//             }
//             // Exponential backoff
//             const delay = initialDelay * Math.pow(2, attempts -1);
//             // Add jitter (randomness) to delay to prevent simultaneous retries
//             const jitter = Math.random() * delay * 0.3; 
//             await new Promise(resolve => setTimeout(resolve, delay + jitter));
//         }
//     }
//     // Should not reach here if maxAttempts > 0, but as a fallback
//     return "Error: Could not generate content after multiple retries."; 
// }


// // --- Reusable Component for ENS ---
// interface AddressDisplayProps {
//   address: string | undefined;
//   provider: BrowserProvider | null;
// }

// const AddressDisplay: FC<AddressDisplayProps> = ({ address, provider }) => {
//     const [displayName, setDisplayName] = useState<string>('');

//     useEffect(() => {
//         const resolveEnsName = async () => {
//              // Basic address validation
//             if (!address || typeof address !== 'string' || !ethers.isAddress(address)) { // Use ethers validation
//                 setDisplayName('Invalid Address');
//                 return;
//             }
            
//             // Initial display before ENS lookup
//             const truncated = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
//             setDisplayName(truncated);

//             if (provider) {
//                 try {
//                     // Ensure provider is ready (especially relevant for initial load)
//                     await provider.ready; 
//                     const name = await provider.lookupAddress(address);
//                     if (name) {
//                         setDisplayName(name); // Display ENS name if found
//                     }
//                     // If no name, truncated address remains set
//                 } catch (error: unknown) {
//                     // Log specific errors but keep truncated address
//                     if (error && typeof error === 'object' && 'code' in error && error.code === 'NETWORK_ERROR') {
//                         console.warn("ENS Lookup failed: Network error. Ensure connection to mainnet or supported testnet.");
//                     } else {
//                          console.warn("Could not resolve ENS name:", error);
//                     }
//                     // Fallback to truncated address is already set
//                 }
//             } else {
//                 console.warn("ENS lookup skipped: Provider not available.");
//                  // Fallback to truncated address is already set
//             }
//         };

//         resolveEnsName();
//     }, [address, provider]); // Rerun if address or provider changes

//     // Tooltip shows full address on hover
//     return (
//         <span className="font-mono" title={address}>
//             {displayName}
//         </span>
//     );
// };

// // --- Reusable Credential Card Component ---
// interface CredentialCardProps {
//   cred: Credential;
//   isStudentView: boolean;
//   provider: BrowserProvider | null;
//   handleDraftPost: (credentialType: string) => void;
//   isDrafting: boolean;
// }

// const CredentialCard: FC<CredentialCardProps> = ({ cred, isStudentView, provider, handleDraftPost, isDrafting }) => {
//     // Basic check for valid credential object
//     if (!cred || typeof cred !== 'object' || cred.id === undefined) {
//         return <div className="text-red-500">Invalid credential data</div>;
//     }

//     // Ensure BigInts are converted to strings safely for display
//     const credIdString = cred.id?.toString() ?? 'N/A';
    
//     return (
//         <div className="font-main bg-gray-50 border p-4 rounded-lg shadow-sm space-y-2 break-inside-avoid"> {/* Added break-inside-avoid */}
//             <p className="text-xs text-gray-400 font-mono">ID: {credIdString}</p>
//             <p className="font-bold text-blue-600 break-words">{cred.credentialType || 'Unknown Type'}</p> {/* Added break-words */}
//             <p className="text-sm text-gray-500 break-words"> {/* Added break-words */}
//                 Issued by: {cred.universityAddress ? <AddressDisplay address={cred.universityAddress} provider={provider} /> : 'Unknown University'}
//             </p>
//             {/* Show student address only in public search views */}
//             {!isStudentView && (
//                 <p className="text-sm text-gray-500 break-words">
//                     Issued to: {cred.studentAddress ? <AddressDisplay address={cred.studentAddress} provider={provider} /> : 'Unknown Student'}
//                 </p>
//             )}
//             <p className={`text-sm font-semibold ${cred.isValid ? 'text-green-600' : 'text-red-600'}`}>
//                 Status: {cred.isValid ? 'Valid' : 'Revoked'}
//             </p>
//             {cred.ipfsHash && (
//                 <a 
//                     href={`https://gateway.pinata.cloud/ipfs/${cred.ipfsHash}`} 
//                     target="_blank" 
//                     rel="noopener noreferrer" 
//                     className="text-blue-500 hover:underline text-xs block break-all" // Added break-all for long hashes
//                 >
//                     View Document (IPFS)
//                 </a>
//             )}
//             {isStudentView && (
//                 <button 
//                     onClick={() => handleDraftPost(cred.credentialType)} 
//                     disabled={isDrafting} 
//                     className="text-xs bg-indigo-100 text-indigo-700 font-semibold py-1 px-3 rounded-full hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2" // Added margin-top
//                 >
//                     {isDrafting ? 'Drafting...' : '✨ Draft Announcement'}
//                 </button>
//             )}
//         </div>
//     );
// };


// function App(): React.ReactElement {
//   const [account, setAccount] = useState<string | null>(null);
//   const [contract, setContract] = useState<Contract | null>(null);
//   const [provider, setProvider] = useState<BrowserProvider | null>(null);
//   const [isOwner, setIsOwner] = useState<boolean>(false);
//   const [isUniversity, setIsUniversity] = useState<boolean>(false);
//   const [networkError, setNetworkError] = useState<string>(''); // For network/RPC issues

//   const connectWallet = async () => {
//      setNetworkError(''); // Clear previous errors
//     if (typeof window.ethereum === 'undefined') {
//         alert("Please install MetaMask or another web3 wallet to use this dApp.");
//         return;
//     }
    
//     try {
//         // Use EIP-6963 to find all available providers if supported
//         let web3Provider: BrowserProvider;
//         if (window.ethereum.providers?.length) {
//             // Prefer MetaMask if available among multiple providers
//             const mmProvider = window.ethereum.providers.find(p => p.isMetaMask);
//             web3Provider = new ethers.BrowserProvider(mmProvider || window.ethereum.providers[0]);
//         } else {
//              web3Provider = new ethers.BrowserProvider(window.ethereum);
//         }
        
//         setProvider(web3Provider);
        
//         // Request accounts
//         const accounts = await web3Provider.send("eth_requestAccounts", []);
//         if (!accounts || accounts.length === 0) {
//             throw new Error("No accounts found. Please unlock your wallet.");
//         }
//         const signer: Signer = await web3Provider.getSigner();
//         const address = await signer.getAddress();
//         setAccount(address);

//         // Check network connection before initializing contract
//         try {
//             await web3Provider.getNetwork(); 
//         } catch (netError) {
//              console.error("Network connection error:", netError);
//              setNetworkError("Could not connect to the blockchain network. Please check your wallet's network settings.");
//              setContract(null); // Ensure contract is null if network fails
//              return; // Stop further execution if network is down
//         }

//         const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
//         setContract(contractInstance);
        
//         checkUserRole(address, contractInstance);
//       } catch (err: unknown) {
//         console.error("Error connecting wallet:", err);
//         let message = "Unknown error occurred";
//         if (err instanceof Error) {
//             message = err.message;
//         } else if (err && typeof err === 'object' && 'message' in err) {
//             message = String(err.message);
//         }

//          if (err && typeof err === 'object' && 'code' in err && err.code === 4001) { // User rejected connection
//              setNetworkError("Wallet connection rejected. Please connect your wallet to proceed.");
//          } else {
//             setNetworkError(`Error connecting wallet: ${message}`);
//          }
//          setAccount(null); // Ensure account is null on error
//          setContract(null);
//       }
//   };

//   const checkUserRole = async (currentAccount: string, currentContract: Contract) => {
//     if (!currentContract || !currentAccount) return;
//     try {
//       const ownerAddress = await currentContract.owner();
//       setIsOwner(currentAccount.toLowerCase() === ownerAddress.toLowerCase());
//       const universityStatus = await currentContract.isUniversity(currentAccount);
//       setIsUniversity(universityStatus);
//     } catch(err: unknown) {
//         console.error("Error checking user role:", err);
//          // Handle potential contract read errors (e.g., wrong network)
//          if (err && typeof err === 'object' && 'code' in err && err.code === 'CALL_EXCEPTION') {
//             setNetworkError("Error reading from contract. Are you on the correct network?");
//          } else {
//             setNetworkError("Could not determine user role.");
//          }
//          setIsOwner(false);
//          setIsUniversity(false);
//     }
//   };

//  useEffect(() => {
//     let providerInstance: Eip6963Provider | null = null;
//     if (typeof window.ethereum !== 'undefined') {
//         // Find the provider instance (handle multiple wallets if necessary)
//         if (window.ethereum.providers?.length) {
//             providerInstance = window.ethereum.providers.find(p => p.isMetaMask) || window.ethereum.providers[0];
//         } else {
//             providerInstance = window.ethereum;
//         }

//         const handleAccountsChanged = (accounts: string[]) => {
//             console.log("Accounts changed:", accounts);
//             if (accounts.length > 0) {
//                 // Reconnect with the new account
//                 connectWallet(); 
//             } else {
//                 // User disconnected all accounts
//                 setAccount(null);
//                 setProvider(null);
//                 setContract(null);
//                 setIsOwner(false);
//                 setIsUniversity(false);
//                 setNetworkError("Wallet disconnected.");
//             }
//         };

//         const handleChainChanged = (chainId: string) => {
//             console.log("Network changed to:", chainId);
//             // Reload the page or reconnect wallet to reflect network change
//             window.location.reload(); 
//         };

//         // Add listeners
//         providerInstance.on('accountsChanged', handleAccountsChanged);
//         providerInstance.on('chainChanged', handleChainChanged);

//         // Initial check for connected accounts
//         connectWallet();

//         // Cleanup function to remove listeners
//         return () => {
//             // Use removeListener if it exists
//             providerInstance?.removeListener?.('accountsChanged', handleAccountsChanged);
//             providerInstance?.removeListener?.('chainChanged', handleChainChanged);
//         };
//     } else {
//          console.log("No web3 wallet detected on initial load.");
//          // Optionally set a state here to show a "Install Wallet" message
//     }
// }, []); // Run only once on component mount
  
//   // --- UI COMPONENTS ---

//   const OwnerPanel: FC = () => {
//     const [uniAddress, setUniAddress] = useState<string>('');
//     const [isLoading, setIsLoading] = useState<boolean>(false);
//     const [message, setMessage] = useState<Message | null>(null);

//     const handleTransaction = async (action: 'addUniversity' | 'removeUniversity') => {
//         let normalizedAddress: string | null;

//         if(ethers.isAddress(uniAddress)){
//             normalizedAddress = uniAddress;
//         } else {
//             // Provider must exist to resolve ENS names
//             if (!provider) {
//                 setMessage({ type: 'error', text: 'Wallet provider not connected.' });
//                 return;
//             }
//             try {
//             normalizedAddress = await provider.resolveName(uniAddress);

//             if (!normalizedAddress) { // If resolveName returns null, check if it's a valid address
//                  if (ethers.isAddress(uniAddress)) {
//                     normalizedAddress = uniAddress;
//                  } else {
//                     throw new Error("Invalid address or ENS name");
//                  }
//             }
//         } catch (err: unknown) {
//             console.warn("Could not resolve ENS name or invalid address:", err)
//             setMessage({ type: 'error', text: 'Please enter a valid Ethereum address or ENS name.' });
//             return;
//         }
//     }

//         // Ensure contract exists
//         if (!contract) {
//              setMessage({ type: 'error', text: 'Contract not initialized.' });
//              return;
//         }
        
//         // Ensure provider exists for lookup (even if not strictly needed for tx)
//         if (!provider) {
//             setMessage({ type: 'error', text: 'Wallet provider not connected.' });
//             return;
//         }

//         setIsLoading(true);
//         setMessage({ type: 'info', text: 'Submitting transaction... Please confirm in MetaMask.' });
//         try {
//             const tx = await contract[action](normalizedAddress); // Use resolved/validated address
//             await tx.wait();
//              // Display potentially resolved ENS name or original input if it was an address
//             const displayAddress = await provider.lookupAddress(normalizedAddress) || normalizedAddress.substring(0,6) + '...' + normalizedAddress.substring(normalizedAddress.length - 4);
//             setMessage({ type: 'success', text: `University ${displayAddress} ${action === 'addUniversity' ? 'added' : 'removed'} successfully!` });
//             setUniAddress('');
//         } catch (err: unknown) {
//             console.error(`Error with ${action}:`, err);
//              let friendlyError = 'Transaction failed. See console for details.';
//              // Try to extract revert reason
//              if (err && typeof err === 'object') {
//                 if ('reason' in err) friendlyError = String(err.reason);
//                 else if ('data' in err && err.data && typeof err.data === 'object' && 'message' in err.data) friendlyError = String(err.data.message);
//                 else if ('message' in err) friendlyError = (err as Error).message.split('(')[0];
//              }
//             setMessage({ type: 'error', text: friendlyError });
//         }
//         setIsLoading(false);
//     };

//     return (
//         <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-md space-y-6">
//             <h2 className="font-main text-2xl font-bold text-gray-800">Owner Admin Panel</h2>
//             <form className="space-y-4" onSubmit={(e: FormEvent<HTMLFormElement>) => e.preventDefault()}>
//                 <div>
//                     <label htmlFor="uniAddress" className="block text-sm font-medium text-gray-700 mb-1">University Address or ENS Name</label>
//                     <input id="uniAddress" type="text" value={uniAddress} onChange={(e: ChangeEvent<HTMLInputElement>) => setUniAddress(e.target.value)} placeholder="0x... or university.eth" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-blue-500 focus-visible:border-blue-500" />
//                 </div>
//                 <div className="flex space-x-4">
//                     <button type="button" onClick={() => handleTransaction('addUniversity')} disabled={isLoading} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
//                         {isLoading ? 'Processing...' : 'Add University'}
//                     </button>
//                     <button type="button" onClick={() => handleTransaction('removeUniversity')} disabled={isLoading} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
//                         {isLoading ? 'Processing...' : 'Remove University'}
//                     </button>
//                 </div>
//             </form>
//             {message && <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{message.text}</div>}
//         </div>
//     );
//   };

//   const UniversityPanel: FC = () => {
//     // State for issuing
//     const [studentAddress, setStudentAddress] = useState<string>('');
//     const [credentialType, setCredentialType] = useState<string>('');
//     const [credentialFile, setCredentialFile] = useState<File | null>(null);
//     const [isIssuing, setIsIssuing] = useState<boolean>(false);
//     const [issueMessage, setIssueMessage] = useState<Message | null>(null);
    
//     // State for revoking
//     const [revokeId, setRevokeId] = useState<string>('');
//     const [isRevoking, setIsRevoking] = useState<boolean>(false);
//     const [revokeMessage, setRevokeMessage] = useState<Message | null>(null);

//     // State for Gemini feature
//     const [showGeminiFeature, setShowGeminiFeature] = useState<boolean>(false);
//     const [geminiSuggestions, setGeminiSuggestions] = useState<string>('');
//     const [isGenerating, setIsGenerating] = useState<boolean>(false);
//     const [lastIssuedType, setLastIssuedType] = useState<string>('');

//     const handleIssueCredential = async (e: FormEvent<HTMLFormElement>) => {

//         const unpinFromPinata = async (ipfsHash: string | null) => {
//             if (!ipfsHash) return;
//             console.warn(`Transaction failed or was rejected. Unpinning ${ipfsHash} from Pinata...`);
//             try {
//               const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${ipfsHash}`, {
//                 method: 'DELETE',
//                 headers: {
//                   Authorization: `Bearer ${PINATA_JWT}`
//                 }
//               });
//               if (!response.ok) {
//                 throw new Error(`Pinata unpin failed (${response.status}): ${await response.text()}`);
//               }
//               console.log(`Successfully unpinned ${ipfsHash}.`);
//             } catch (unpinErr: unknown) {
//               // Log this error for debugging, but don't show it to the user.
//               // The primary error (transaction failed) is more important.
//               console.error("Error while unpinning file from Pinata:", unpinErr);
//             }
//           };
        
//         e.preventDefault();
//         setShowGeminiFeature(false); setGeminiSuggestions('');
        
//         let normalizedStudentAddress: string | null;
        
//         // Ensure provider and contract are available
//         if (!provider) {
//             setIssueMessage({ type: 'error', text: 'Wallet provider not connected.' });
//             return;
//         }
//         if (!contract) {
//             setIssueMessage({ type: 'error', text: 'Contract not initialized.' });
//             return;
//         }
    
//         // First, check if the input is already a valid address
//         if (ethers.isAddress(studentAddress)) {
//             normalizedStudentAddress = studentAddress;
//         } else {
//             // If it's NOT an address, *then* try to resolve it as an ENS name
//             try {
//                 setIssueMessage({ type: 'info', text: 'Resolving ENS name...' });
//                 normalizedStudentAddress = await provider.resolveName(studentAddress);
                
//                 if (!normalizedStudentAddress) {
//                     // It's not an address AND it failed to resolve as an ENS name
//                     throw new Error("Input is not a valid address or resolvable ENS name.");
//                 }
//                 // If we're here, ENS resolution was successful
//                 setIssueMessage({ type: 'info', text: `Resolved ${studentAddress} to ${normalizedStudentAddress.substring(0,6)}...` });
            
//             } catch (err: unknown) {
//                  console.warn("Could not resolve ENS name or invalid address:", err);
//                  setIssueMessage({ type: 'error', text: 'Invalid student Ethereum address or ENS name.' });
//                 return; // Stop execution
//             }
//         }

//         if (!credentialType || !credentialFile) {
//             setIssueMessage({ type: 'error', text: 'Please fill out all fields.' });
//             return;
//         }

//         setIsIssuing(true); setIssueMessage({ type: 'info', text: 'Uploading file to IPFS...' });
        
//         const formData = new FormData(); formData.append('file', credentialFile);
//         let ipfsHash: string | null = null;
        
//         try {
//             const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', { method: 'POST', headers: { Authorization: `Bearer ${PINATA_JWT}` }, body: formData });
//             if (!pinataResponse.ok) {
//                 const errorData = await pinataResponse.text(); // Get more detailed error
//                 throw new Error(`Pinata Error ${pinataResponse.status}: ${errorData}`);
//             }
            
//             const result: { IpfsHash?: string } = await pinataResponse.json(); 
//             if (!result.IpfsHash) {
//                  throw new Error("Pinata response did not include IpfsHash.");
//             }
//             ipfsHash = result.IpfsHash;
            
//             setIssueMessage({ type: 'info', text: `File on IPFS (${ipfsHash.substring(0,6)}...). Confirm in MetaMask.` });
            
//             const tx = await contract.issueCredential(normalizedStudentAddress, credentialType, ipfsHash); 
//             await tx.wait();
            
//             setIssueMessage({ type: 'success', text: 'Credential issued successfully!' });
//             setLastIssuedType(credentialType); 
//             setShowGeminiFeature(true);
//             setStudentAddress(''); setCredentialType(''); setCredentialFile(null); 
            
//             // Reset file input more reliably
//             const fileInput = (e.target as HTMLFormElement).elements.namedItem('credentialFile') as HTMLInputElement;
//             if (fileInput) { 
//                  fileInput.value = '';
//              }
//         } catch (err: unknown) {
//             console.error("Error issuing credential:", err); 
//             if (ipfsHash) {
//                 await unpinFromPinata(ipfsHash); 
//             }
//              let friendlyError = 'Transaction failed. See console for details.';
             
//              if (err && typeof err === 'object') {
//                 if ('code' in err && err.code === 4001) {
//                     friendlyError = "Transaction rejected. The file upload has been cancelled.";
//                 } else if ('reason' in err) {
//                     friendlyError = String(err.reason);
//                 } else if ('data' in err && err.data && typeof err.data === 'object' && 'message' in err.data) {
//                     friendlyError = String(err.data.message);
//                 } else if ('message' in err) {
//                     friendlyError = (err as Error).message.split('(')[0];
//                 }
//              }
//             setIssueMessage({ type: 'error', text: friendlyError });
//         }
//         setIsIssuing(false);
//     };

//     const handleRevokeCredential = async (e: FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
        
//         if (!contract) {
//              setRevokeMessage({ type: 'error', text: 'Contract not initialized.' });
//              return;
//         }
        
//         const idToRevoke = revokeId.trim();
//         if (!idToRevoke || !/^\d+$/.test(idToRevoke)) { // Basic check if it's a number string
//             setRevokeMessage({ type: 'error', text: 'Please enter a valid Credential ID (numeric).' });
//             return;
//         }
        
//         setIsRevoking(true);
//         setRevokeMessage({ type: 'info', text: 'Submitting revocation... Please confirm in MetaMask.' });
        
//         try {
//             const tx = await contract.revokeCredential(idToRevoke); // Pass the numeric string
//             await tx.wait();
//             setRevokeMessage({ type: 'success', text: `Credential #${idToRevoke} has been revoked.` });
//             setRevokeId('');
//         } catch (err: unknown) {
//             console.error("Error revoking credential:", err);
//             let friendlyError = 'Transaction failed. Check console.';
            
//             // Better error parsing
//             if (err && typeof err === 'object') {
//                 if ('reason' in err) friendlyError = String(err.reason);
//                 else if ('data' in err && err.data && typeof err.data === 'object' && 'message' in err.data) friendlyError = String(err.data.message);
//                 else if ('message' in err) friendlyError = (err as Error).message.split('(')[0];
//             }
            
//             // Check for specific revert reasons from the contract
//             if (friendlyError.includes("Not the issuing university")) {
//                  friendlyError = "Revocation failed: Only the original issuing university can revoke this credential.";
//             } else if (friendlyError.includes("Credential already revoked")) {
//                  friendlyError = "Credential already revoked.";
//             } else if (friendlyError.includes("Credential not found")) {
//                  friendlyError = "Credential ID not found.";
//             }

//             setRevokeMessage({ type: 'error', text: friendlyError });
//         }
//         setIsRevoking(false);
//     };

//     const handleGenerateSuggestions = async () => {
//         setIsGenerating(true); setGeminiSuggestions('');
//         const prompt = `A student has just been awarded a "${lastIssuedType}". Generate a concise list of 3-5 potential career paths or further study options. Format as a simple markdown list.`;
//         const suggestions = await callGeminiAPI(prompt);
//         setGeminiSuggestions(suggestions); setIsGenerating(false);
//     };

//     const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
//         if (e.target.files && e.target.files.length > 0) {
//             setCredentialFile(e.target.files[0]);
//         } else {
//             setCredentialFile(null);
//         }
//     };

//     return (
//         <div className="space-y-8">
//             {/* Issue Credential Panel */}
//             <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-md space-y-6">
//                 <h2 className="text-2xl font-bold text-gray-800">University Portal: Issue Credential</h2>
//                 <form onSubmit={handleIssueCredential} className="space-y-4">
//                     <div><label htmlFor="studentAddress" className="block text-sm font-medium text-gray-700 mb-1">Student's Address or ENS Name</label><input id="studentAddress" name="studentAddress" type="text" value={studentAddress} onChange={(e: ChangeEvent<HTMLInputElement>) => setStudentAddress(e.target.value)} placeholder="0x... or student.eth" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-blue-500 focus-visible:border-blue-500" /></div>
//                     <div><label htmlFor="credentialType" className="block text-sm font-medium text-gray-700 mb-1">Credential Type</label><input id="credentialType" name="credentialType" type="text" value={credentialType} onChange={(e: ChangeEvent<HTMLInputElement>) => setCredentialType(e.target.value)} placeholder="e.g., Bachelor of Science in Computer Science" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-blue-500 focus-visible:border-blue-500" /></div>
//                     <div>
//                         <label htmlFor="credentialFile" className="block text-sm font-medium text-gray-700 mb-1">Credential Document</label>
//                         <input 
//                             id="credentialFile" 
//                             name="credentialFile" 
//                             type="file" 
//                             onChange={handleFileChange} 
//                             className="w-full text-sm text-gray-500 file-input:mr-4 file-input:py-2 file-input:px-4 file-input:rounded-full file-input:border-0 file-input:text-sm file-input:font-semibold file-input:bg-blue-50 file-input:text-blue-700 hover:file-input:bg-blue-100"
//                         />
//                     </div>
//                     <button type="submit" disabled={isIssuing} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{isIssuing ? 'Processing...' : 'Issue Credential'}</button>
//                 </form>
//                 {issueMessage && <div className={`p-3 rounded-md text-sm ${issueMessage.type === 'success' ? 'bg-green-100 text-green-800' : issueMessage.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{issueMessage.text}</div>}
//                 {showGeminiFeature && <div className="border-t pt-4 mt-4 space-y-3"><h3 className="text-lg font-semibold text-gray-700">Next Steps for Student</h3><button onClick={handleGenerateSuggestions} disabled={isGenerating} className="flex items-center justify-center w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300">{isGenerating ? 'Generating...' : '✨ Generate Career Path Suggestions'}</button>{geminiSuggestions && <div className="bg-purple-50 p-4 rounded-md text-purple-800 whitespace-pre-wrap">{geminiSuggestions}</div>}</div>}
//             </div>

//             {/* Revoke Credential Panel */}
//             <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-md space-y-6">
//                 <h2 className="text-2xl font-bold text-gray-800">Revoke Credential</h2>
//                 <form onSubmit={handleRevokeCredential} className="space-y-4">
//                     <div>
//                         <label htmlFor="revokeId" className="block text-sm font-medium text-gray-700 mb-1">Credential ID</label>
//                         <input 
//                             id="revokeId" 
//                             type="text" 
//                             value={revokeId} 
//                             onChange={(e: ChangeEvent<HTMLInputElement>) => setRevokeId(e.target.value)} 
//                             placeholder="Enter the ID of the credential to revoke" 
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-red-500 focus-visible:border-red-500" 
//                         />
//                     </div>
//                     <button type="submit" disabled={isRevoking} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
//                         {isRevoking ? 'Processing...' : 'Revoke Credential'}
//                     </button>
//                 </form>
//                 {revokeMessage && <div className={`p-3 rounded-md text-sm ${revokeMessage.type === 'success' ? 'bg-green-100 text-green-800' : revokeMessage.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{revokeMessage.text}</div>}
//             </div>
//         </div>
//     );
//   };

//   // --- VerifyCredentialPanel (by ID) ---
//   interface VerifyCredentialPanelProps {
//     provider: BrowserProvider | null;
//     contract: Contract | null;
//   }
  
//   const VerifyCredentialPanel: FC<VerifyCredentialPanelProps> = ({ provider, contract }) => {
//     const [searchId, setSearchId] = useState<string>('');
//     const [searchedCredential, setSearchedCredential] = useState<Credential | null>(null);
//     const [isVerifying, setIsVerifying] = useState<boolean>(false);
//     const [verifyMessage, setVerifyMessage] = useState<string>('');

//     const handleVerify = async (e: FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         const idToVerify = searchId.trim();
//         if(!contract || !idToVerify || !/^\d+$/.test(idToVerify)) { 
//             setVerifyMessage("Please enter a valid Credential ID (numeric)."); 
//             return; 
//         }
//         setIsVerifying(true); setSearchedCredential(null); setVerifyMessage('');
//         try {
//             const cred: Credential = await contract.credentials(idToVerify);
//             if (cred.issueDate.toString() === '0') { 
//                 setVerifyMessage(`Credential with ID #${idToVerify} was not found.`); 
//             } else { 
//                 setSearchedCredential(cred); 
//             }
//         } catch (err: unknown) { 
//             console.error("Error verifying credential:", err); 
//             let friendlyError = "An error occurred during verification.";
//             if (err && typeof err === 'object') {
//                 if ('reason' in err) friendlyError = String(err.reason);
//                 else if ('data' in err && err.data && typeof err.data === 'object' && 'message' in err.data) friendlyError = String(err.data.message);
//                 else if ('message' in err) friendlyError = (err as Error).message.split('(')[0];
//             }
//             setVerifyMessage(friendlyError); 
//         }
//         setIsVerifying(false);
//     };

//     return (
//         <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-md">
//             <h3 className="text-2xl font-bold text-gray-800 mb-4">Verify a Credential by ID</h3>
//             <form onSubmit={handleVerify} className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
//                 <input 
//                     type="text" 
//                     value={searchId} 
//                     onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchId(e.target.value)} 
//                     placeholder="Enter Credential ID (e.g., 0)" 
//                     className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-blue-500 focus-visible:border-blue-500" 
//                 />
//                 <button 
//                     type="submit" 
//                     disabled={isVerifying} 
//                     className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                 >
//                     {isVerifying ? 'Verifying...' : 'Verify'}
//                 </button>
//             </form>
//             <div className="mt-4">
//                 {searchedCredential && <CredentialCard cred={searchedCredential} isStudentView={false} provider={provider} handleDraftPost={() => {}} isDrafting={false} />}
//                 {verifyMessage && !searchedCredential && <p className="text-gray-600 mt-2 text-sm">{verifyMessage}</p>}
//             </div>
//         </div>
//     );
//   };

//   // --- NEW SearchByStudentPanel (by Address) ---
//   interface SearchByStudentPanelProps {
//     provider: BrowserProvider | null;
//     contract: Contract | null;
//   }
  
//   const SearchByStudentPanel: FC<SearchByStudentPanelProps> = ({ provider, contract }) => {
//     const [studentAddress, setStudentAddress] = useState<string>(''); // Input field
//     const [searchedCredentials, setSearchedCredentials] = useState<Credential[]>([]);
//     const [isSearching, setIsSearching] = useState<boolean>(false);
//     const [searchMessage, setSearchMessage] = useState<string>('');

//     const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
//       e.preventDefault();
//       const addressToSearch = studentAddress.trim();
//       if(!contract || !provider || !addressToSearch) {
//           setSearchMessage("Please connect your wallet and enter a student address or ENS name.");
//           return;
//       }

//       setIsSearching(true);
//       setSearchedCredentials([]);
//       setSearchMessage('');
//       let resolvedAddress: string | null;

//       try {
//           // Resolve ENS/Validate Address
//           if (ethers.isAddress(addressToSearch)) {
//               resolvedAddress = addressToSearch;
//           } else {
//               setSearchMessage("Resolving ENS name...");
//               resolvedAddress = await provider.resolveName(addressToSearch);
//               if (!resolvedAddress) {
//                   throw new Error("Invalid address or unresolvable ENS name.");
//               }
//           }

//           setSearchMessage("Fetching credential IDs...");
//           const ids: bigint[] = await contract.getStudentCredentialIds(resolvedAddress);

//           if (ids.length === 0) {
//               setSearchMessage(`No credentials found for ${addressToSearch}.`);
//           } else {
//               setSearchMessage(`Found ${ids.length} credential(s). Fetching details...`);
//               const creds: Credential[] = await Promise.all(ids.map(id => contract.credentials(id)));
//               setSearchedCredentials(creds);
//               setSearchMessage(`${creds.length} credential(s) found for ${addressToSearch}.`);
//           }
//       } catch (err: unknown) {
//           console.error("Error searching credentials:", err);
//           let friendlyError = "An error occurred during the search.";
//           if (err && typeof err === 'object') {
//               if ('reason' in err) friendlyError = String(err.reason);
//               else if ('message' in err) friendlyError = (err as Error).message.split('(')[0];
//           }
//           setSearchMessage(friendlyError);
//       }
//       setIsSearching(false);
//     };

//     return (
//       <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-md">
//           <h3 className="text-2xl font-bold text-gray-800 mb-4">Search Credentials by Student</h3>
//           <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
//               <input
//                   type="text"
//                   value={studentAddress}
//                   onChange={(e: ChangeEvent<HTMLInputElement>) => setStudentAddress(e.target.value)}
//                   placeholder="Enter Student Address or ENS Name"
//                   className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-blue-500 focus-visible:border-blue-500"
//               />
//               <button
//                   type="submit"
//                   disabled={isSearching}
//                   className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//               >
//                   {isSearching ? 'Searching...' : 'Search'}
//               </button>
//           </form>
//           <div className="mt-4">
//               {searchMessage && !searchedCredentials.length && <p className="text-gray-600 mt-2 text-sm">{searchMessage}</p>}
//               {searchedCredentials.length > 0 && (
//                   <>
//                       <p className="text-gray-700 mt-2 text-sm mb-4">{searchMessage}</p>
//                       <div className="columns-1 md:columns-2 gap-4">
//                           {searchedCredentials.map(cred => (
//                               <CredentialCard
//                                   key={cred.id.toString()}
//                                   cred={cred}
//                                   isStudentView={false} // This is a public search view
//                                   provider={provider}
//                                   handleDraftPost={() => {}} 
//                                   isDrafting={false}
//                               />
//                           ))}
//                       </div>
//                   </>
//               )}
//           </div>
//       </div>
//     );
//   };


//   // --- StudentView (Shows "My Credentials") ---
//   interface StudentViewProps {
//     provider: BrowserProvider | null;
//   }
  
//   const StudentView: FC<StudentViewProps> = ({ provider }) => {
//     const [myCredentials, setMyCredentials] = useState<Credential[]>([]);
//     const [isMyCredsLoading, setIsMyCredsLoading] = useState<boolean>(true);
//     const [draftPost, setDraftPost] = useState<string>('');
//     const [isDrafting, setIsDrafting] = useState<boolean>(false);
//     const [errorMsg, setErrorMsg] = useState<string>(''); // State for errors

//     useEffect(() => {
//         const fetchMyCredentials = async () => {
//              setErrorMsg(''); // Clear previous errors
//             if (contract && account) {
//                 setIsMyCredsLoading(true); 
//                 try {
//                     // Added error handling for contract calls
//                     const ids: bigint[] = await contract.getStudentCredentialIds(account);
//                     if (!Array.isArray(ids)) {
//                         throw new Error("Invalid response format for credential IDs.");
//                     }
//                     // Fetch details only if IDs array is not empty
//                     const creds: Credential[] = ids.length > 0 
//                         ? await Promise.all(ids.map(id => contract.credentials(id)))
//                         : [];
//                     setMyCredentials(creds);
//                 } catch (err: unknown) { 
//                     console.error("Error fetching student credentials:", err); 
//                     setErrorMsg("Could not fetch your credentials. Please ensure you're on the correct network and try again.");
//                 } finally {
//                     setIsMyCredsLoading(false);
//                 }
//             } else {
//                  setIsMyCredsLoading(false); // Ensure loading stops if contract/account not ready
//             }
//         };
//         fetchMyCredentials();
        
//         // Setup event listeners for real-time updates
//         // FIX: Use DeferredTopicFilter and initialize as null
//         let studentFilter: DeferredTopicFilter | null = null;
//         let revokeFilter: DeferredTopicFilter | null = null;
        
//         const eventListener = (credentialId: bigint) => {
//             console.log(`Event detected for ID: ${credentialId?.toString()}, refetching credentials.`);
//             fetchMyCredentials(); // Refetch all credentials on relevant events
//         };
        
//         if (contract) {
//             try {
//                 studentFilter = contract.filters.CredentialIssued(null, account);
//                 revokeFilter = contract.filters.CredentialRevoked();
                
//                 contract.on(studentFilter, eventListener);
//                 contract.on(revokeFilter, eventListener);
//             } catch (listenerError: unknown) {
//                  console.error("Error setting up event listeners:", listenerError);
//                  setErrorMsg("Could not set up real-time updates.");
//             }
//         }
        
//         // Cleanup function for event listeners
//         return () => {
//              if (contract) {
//                  try {
//                     // FIX: Add null checks before calling .off()
//                     if (studentFilter) {
//                         contract.off(studentFilter, eventListener);
//                     }
//                     if (revokeFilter) {
//                         contract.off(revokeFilter, eventListener);
//                     }
//                  } catch (cleanupError: unknown) {
//                       console.error("Error removing event listeners:", cleanupError);
//                  }
//              }
//         };
        
//     }, [contract, account]); // Dependencies ensure this runs when contract/account changes

//     const handleDraftPost = async (credentialType: string) => {
//         setIsDrafting(true); setDraftPost('');
//         const prompt = `Write a professional and enthusiastic LinkedIn post for a student announcing they have earned a "${credentialType}". Include placeholders like "[University Name]" and suggest relevant hashtags. Make it concise and engaging.`;
//         const post = await callGeminiAPI(prompt);
//         setDraftPost(post); setIsDrafting(false);
//     };


//     const handleCopy = () => {
//         navigator.clipboard.writeText(draftPost)
//             .then(() => {
//                 // Optional: Show a temporary success message
//                 const button = document.getElementById('copyButton');
//                 if(button) {
//                     button.textContent = 'Copied!';
//                     setTimeout(() => { 
//                         if(button) button.textContent = 'Copy Post'; 
//                     }, 1500);
//                 }
//             })
//             .catch(err => console.error('Failed to copy text: ', err));
//     };


//     return (
//         <div className="space-y-8">
//             {/* My Credentials Section */}
//             <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-md">
//                 <h3 className="text-2xl font-bold text-gray-800 mb-4">My Credentials</h3>
//                 {errorMsg && <p className="text-red-600 mb-4">{errorMsg}</p>} 
//                 {isMyCredsLoading ? <p className="text-gray-500">Loading your credentials...</p> : 
//                     myCredentials.length > 0 ? (
//                         // Use CSS columns for better layout on wider screens
//                         <div className="columns-1 md:columns-2 gap-4"> 
//                             {myCredentials.map(cred => (
//                                 <CredentialCard 
//                                     key={cred.id.toString()} 
//                                     cred={cred} 
//                                     isStudentView={true} 
//                                     provider={provider} 
//                                     handleDraftPost={handleDraftPost}
//                                     isDrafting={isDrafting}
//                                 />
//                             ))}
//                         </div>
//                     ) : (
//                          <p className="text-gray-500">No credentials have been issued to your address.</p>
//                     )
//                 }
//                 {/* Display Draft Post section only if a post has been generated */}
//                 {draftPost && (
//                     <div className="mt-6 border-t pt-4 space-y-2">
//                         <h4 className="font-semibold text-gray-700">Your Draft Announcement:</h4>
//                         <textarea 
//                             value={draftPost} 
//                             readOnly 
//                             rows={6} // Adjust height as needed
//                             className="w-full p-3 border rounded-md bg-gray-50 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500" 
//                         />
//                         <button 
//                             id="copyButton"
//                             onClick={handleCopy} 
//                             className="bg-gray-200 text-sm font-semibold py-1 px-3 rounded-full hover:bg-gray-300 transition duration-150"
//                         >
//                             Copy Post
//                         </button>
//                     </div>
//                 )}
//             </div>
//             {/* Verification Panel is now rendered separately below */}
//         </div>
//     );
//   };


//   return (
//     <div className="min-h-screen bg-gray-100 font-sans">
//       <header className="bg-white shadow">
//         <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
//           <div className="text-2xl font-bold text-gray-800">
//             Cred<span className="text-blue-600">Chain</span>
//           </div>
//           <div>
//             {account ? (
//               <div className="bg-gray-200 text-gray-700 text-sm font-semibold py-2 px-4 rounded-full">
//                 <AddressDisplay address={account} provider={provider} />
//               </div>
//             ) : (
//               <button 
//                 onClick={connectWallet}
//                 className="bg-blue-600 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700 transition duration-300 disabled:opacity-50"
//                 disabled={!!networkError && !account} // Disable if network error before connection
//               >
//                 Connect Wallet
//               </button>
//             )}
//           </div>
//         </nav>
//       </header>

//       <main className="container mx-auto px-4 sm:px-6 py-10">
//         <div className="text-center mb-12">
//             <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
//                 A New Standard in <span className="text-blue-600">Academic Verification</span>
//             </h1>
//             <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
//                 Securely issue, manage, and verify academic credentials on the blockchain.
//             </p>
//         </div>

//         {/* Display Network Error centrally if it exists */}
//          {networkError && (
//              <div className="mb-8 text-center bg-red-100 text-red-800 p-4 rounded-lg shadow-md">
//                 {networkError}
//              </div>
//          )}


//         {!account ? (
//            // Only show connect prompt if there isn't already a network error preventing connection
//            !networkError && (
//                 <div className="text-center bg-yellow-100 text-yellow-800 p-4 rounded-lg shadow-md">
//                     Please connect your wallet to access your portal.
//                 </div>
//            )
//         ) : (
//           // Main content area for connected users
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
//             {/* === Main Content (2/3 width) === */}
//             <div className="lg:col-span-2 space-y-8">
//               {/* Role-specific panels appear here */}
//               {isOwner && <OwnerPanel />}
//               {isUniversity && <UniversityPanel />}
              
//               {/* Student View (only shows "My Credentials") */}
//               {!isOwner && !isUniversity && <StudentView provider={provider} />} 
//             </div>

//             {/* === Sidebar (1/3 width) === */}
//             <div className="space-y-8">
//               {/* Public Verification Panels stack here */}
//               <VerifyCredentialPanel provider={provider} contract={contract} /> 
//               <SearchByStudentPanel provider={provider} contract={contract} />
//             </div>

//           </div>
//         )}
//       </main>
//        <footer className="text-center py-6 mt-12 text-sm text-gray-500 border-t">
//             CredChain - Decentralized Credential Verification
//        </footer>
//     </div>
//   );
// }

// export default App;


// src/app.tsx

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
const contractABI: InterfaceAbi = [
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