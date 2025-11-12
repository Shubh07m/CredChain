// UniversityPanel.tsx

import { useState } from 'react'; // 'React' removed, only 'useState' is a value
import type { FC, FormEvent, ChangeEvent } from 'react'; // Types imported separately
import { ethers, Contract, BrowserProvider } from 'ethers';
import { LoadingSpinner, AlertBox } from './ui'; // Assuming ui.tsx
//
// --- ⚠️ ACTION REQUIRED ---
// You must import callGeminiAPI and marked from your utility files
// import { callGeminiAPI } from '@/lib/gemini';
// import { marked } from 'marked'; 
//
// -------------------------

// Define a reusable Message type
interface Message {
  type: 'success' | 'error' | 'info';
  text: string;
}

// Define props
interface UniversityPanelProps {
  contract: Contract | null;
  provider: BrowserProvider | null; // Added provider for ENS
  PINATA_JWT: string;
}

// Dummy function to avoid TS errors. Replace with your real import.
const callGeminiAPI = async (prompt: string): Promise<string> => { 
  console.log("Calling mock Gemini API with prompt:", prompt);
  return new Promise(resolve => setTimeout(() => resolve("* Mock career path 1\n* Mock career path 2"), 1000));
};
// Dummy function. Replace with your real import.
const marked = (text: string) => text;

export const UniversityPanel: FC<UniversityPanelProps> = ({ contract, provider, PINATA_JWT }) => {
  const [studentAddress, setStudentAddress] = useState<string>('');
  const [credentialType, setCredentialType] = useState<string>('');
  const [credentialFile, setCredentialFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [showGeminiFeature, setShowGeminiFeature] = useState<boolean>(false);
  const [geminiSuggestions, setGeminiSuggestions] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [lastIssuedType, setLastIssuedType] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleIssueCredential = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowGeminiFeature(false);
    setGeminiSuggestions('');
    
    if (!contract || !provider) {
      setMessage({ type: 'error', text: 'Contract or provider not initialized.' });
      return;
    }

    let normalizedAddress: string | null = null;

    // --- ENS Resolution Logic ---
    if (ethers.isAddress(studentAddress)) {
      normalizedAddress = studentAddress;
    } else {
      try {
        setMessage({ type: 'info', text: 'Resolving ENS name...' });
        normalizedAddress = await provider.resolveName(studentAddress);
        if (!normalizedAddress) {
          throw new Error("Invalid address or ENS name");
        }
      } catch (err) {
        console.warn("Could not resolve ENS name or invalid address:", err);
        setMessage({ type: 'error', text: 'Please enter a valid Ethereum address or ENS name.' });
        return;
      }
    }
    // --- End ENS Logic ---

    if (!credentialType || !credentialFile) {
      setMessage({ type: 'error', text: 'Please fill all fields.' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: 'info', text: 'Uploading file to IPFS...' });
    
    const formData = new FormData();
    formData.append('file', credentialFile);

    try {
      const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: { Authorization: `Bearer ${PINATA_JWT}` },
        body: formData
        // You would add an onUploadProgress listener to the fetch/axios request here
        // to update setUploadProgress, but standard fetch doesn't support it easily.
      });

      if (!pinataResponse.ok) {
        throw new Error(`Pinata Error: ${pinataResponse.statusText}`);
      }

      const result = await pinataResponse.json();
      const ipfsHash = result.IpfsHash;

      setMessage({ 
        type: 'info', 
        text: `File uploaded to IPFS (${ipfsHash.substring(0,6)}...). Confirm the transaction in your wallet.` 
      });

      const tx = await contract.issueCredential(normalizedAddress, credentialType, ipfsHash);
      setMessage({ type: 'info', text: 'Transaction submitted. Waiting for confirmation...' });
      await tx.wait();
      
      setMessage({ type: 'success', text: 'Credential issued successfully!' });
      setLastIssuedType(credentialType);
      setShowGeminiFeature(true);
      
      // Reset form
      setStudentAddress('');
      setCredentialType('');
      setCredentialFile(null);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      console.error("Error issuing credential:", err);
      setMessage({ 
        type: 'error', 
        text: err.reason || 'Transaction failed. Please check console for details.' 
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleGenerateSuggestions = async () => {
    setIsGenerating(true);
    setGeminiSuggestions('');
    const prompt = `A student has just been awarded a "${lastIssuedType}". Generate a concise list of 3-5 potential career paths or further study options. Format as a simple markdown list.`;
    const suggestions = await callGeminiAPI(prompt);
    setGeminiSuggestions(suggestions);
    setIsGenerating(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCredentialFile(e.target.files[0]);
    } else {
      setCredentialFile(null);
    }
  };

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm space-y-6">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Issue New Credential</h2>
      </div>

      <form onSubmit={handleIssueCredential} className="space-y-4">
        <div>
          <label htmlFor="studentAddress" className="block text-sm font-medium text-gray-700 mb-1">
            Student's Ethereum Address or ENS
          </label>
          <input
            id="studentAddress"
            type="text"
            value={studentAddress}
            onChange={(e) => setStudentAddress(e.target.value)}
            placeholder="0x... or student.eth"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-red-800 focus:text-black-500"
          />
        </div>

        <div>
          <label htmlFor="credentialType" className="block text-sm font-medium text-gray-700 mb-1">
            Credential Type
          </label>
          <input
            id="credentialType"
            type="text"
            value={credentialType}
            onChange={(e) => setCredentialType(e.target.value)}
            placeholder="e.g., Bachelor of Science in Computer Science"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-red-800 focus:text-black-500"
          />
        </div>

        <div>
          <label htmlFor="credentialFile" className="block text-sm font-medium text-gray-700 mb-1">
            Credential Document
          </label>
          <input
            id="credentialFile"
            type="file"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex justify-center items-center space-x-2"
        >
          {isLoading ? (
            <>
              <LoadingSpinner />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Issue Credential</span>
            </>
          )}
        </button>
      </form>

      {message && (
        <AlertBox 
          type={message.type} 
          message={message.text} 
          onClose={() => setMessage(null)} 
        />
      )}

      {showGeminiFeature && (
        <div className="border-t pt-4 mt-4 space-y-3">
          <h3 className="text-lg font-semibold text-gray-700">Next Steps for Student</h3>
          <button
            onClick={handleGenerateSuggestions}
            disabled={isGenerating}
            className="w-full bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex justify-center items-center space-x-2"
          >
            {isGenerating ? (
              <>
                <LoadingSpinner />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Generate Career Path Suggestions</span>
              </>
            )}
          </button>
          {geminiSuggestions && (
            <div className="bg-purple-50 p-4 rounded-lg prose prose-purple max-w-none">
              {/* This is a simple way to render markdown. For safety, `marked` is better */}
              <div dangerouslySetInnerHTML={{ __html: marked(geminiSuggestions) }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};