// UniversityPanel.tsx

import { useState } from 'react'; // 'React' removed, only 'useState' is a value
import type { FC, FormEvent, ChangeEvent } from 'react'; // Types imported separately
import { ethers, Contract, BrowserProvider } from 'ethers';
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Loader2, AlertCircle, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsContents,
} from '@/components/ui/shadcn-io/tabs';

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
  // --- ADD THESE NEW STATES ---
const [revokeId, setRevokeId] = useState<string>('');
const [isRevoking, setIsRevoking] = useState<boolean>(false);
const [revokeMessage, setRevokeMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);


const handleRevokeCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TypeScript check: ensure contract exists
    if (!contract) {
        setRevokeMessage({ type: 'error', text: 'Contract not connected.' });
        return;
    }

    const idToRevoke = revokeId.trim();
    
    // Basic check if it's a number string
    if (!idToRevoke || !/^\d+$/.test(idToRevoke)) { 
        setRevokeMessage({ type: 'error', text: 'Please enter a valid Credential ID (numeric).' });
        return;
    }
    
    setIsRevoking(true);
    setRevokeMessage({ type: 'info', text: 'Submitting revocation... Please confirm in MetaMask.' });
    
    try {
        const tx = await contract.revokeCredential(idToRevoke);
        await tx.wait();
        setRevokeMessage({ type: 'success', text: `Credential #${idToRevoke} has been revoked.` });
        setRevokeId('');
    } catch (err: any) {
        console.error("Error revoking credential:", err);
        let friendlyError = 'Transaction failed. Check console.';
        
        // Error parsing logic
        if (err.reason) { friendlyError = err.reason; } 
        else if (err.data?.message) { friendlyError = err.data.message; }
        else if (err.message) { friendlyError = err.message.split('(')[0]; }
        
        if (friendlyError.includes("Not the issuing university")) {
                friendlyError = "Revocation failed: Only the original issuing university can revoke this credential.";
        } else if (friendlyError.includes("Credential already revoked")) {
                friendlyError = "Credential already revoked.";
        } else if (friendlyError.includes("Credential not found")) {
                friendlyError = "Credential ID not found.";
        }

        setRevokeMessage({ type: 'error', text: friendlyError });
    }
    setIsRevoking(false);
};


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
    <Tabs defaultValue="issue" className="w-full max-w-md bg-muted rounded-lg mx-auto">
      <TabsList  className="grid w-full grid-cols-2" transition={{ type: 'spring', stiffness: 300, damping: 15, mass: 1.2 }}>
        <TabsTrigger value="issue">Issue</TabsTrigger>
        <TabsTrigger value="revoke">Revoke</TabsTrigger>
      </TabsList>
      <TabsContents className="mx-1 mb-1 -mt-2 rounded-sm h-full bg-background" transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}>
        <TabsContent value="issue" className="space-y-6 p-6">
      {/* <Card className="w-full max-w-sm bg-zinc-900 border-zinc-700 text-white shadow-lg"> */}
        <Card className="w-full max-w-2xl md:max-w-3xl bg-black/60 backdrop-blur-2xl text-white border-white/10 shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-center sm:items-center gap-3 w-full">
          <svg className="w-6 h-6 text-white-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <CardTitle>Issue Credential</CardTitle>
          </div>
          <CardDescription>
            Issue a credential for a student by filling out the form below.
          </CardDescription>
        </CardHeader>
      <CardContent>
              <form onSubmit={handleIssueCredential} className="space-y-4">
        <div className="grid w-full items-center gap-4">
          <Label htmlFor="studentAddress">
            Student's Ethereum Address or ENS
          </Label>
          <Input
            id="studentAddress"
            value={studentAddress}
            onChange={(e) => setStudentAddress(e.target.value)}
            placeholder="0x... or student.eth"
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="credentialType">
            Credential Type
          </Label>
          
          <Input
            id="credentialType"
            value={credentialType}
            onChange={(e) => setCredentialType(e.target.value)}
            placeholder="e.g., Bachelor of Science in Computer Science"
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="credentialFile">
            Credential Document
          </Label>
          <Input
            id="credentialFile"
            type="file"
            onChange={handleFileChange}
            className="text-white
      file:text-white
      file:bg-slate-900
      file:border-0
      file:rounded-md
      file:px-3
      file:py-1
      file:mr-3
      file:cursor-pointer"
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

        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
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
        </Button>
      </form>
      </CardContent>
      <CardFooter className="flex justify-between">
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'success' && <CheckCircle className="h-4 w-4" />}
          {message.type === 'error' && <AlertCircle className="h-4 w-4" />}
          {message.type === 'info' && <Info className="h-4 w-4" />}
          <AlertTitle>
            {
              {
                success: 'Success',
                error: 'Error',
                info: 'Information',
              }[message.type]
            }
          </AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}
      </CardFooter>
      </Card>
      </TabsContent>


<TabsContent value="revoke" className="space-y-6 p-6">
<Card className="w-full max-w-2xl md:max-w-3xl bg-black/60 backdrop-blur-2xl text-white border-white/10 shadow-xl">
<CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-center sm:items-center gap-3 w-full">
                <CardTitle>Revoke Credential</CardTitle>
          </div>
          <CardDescription>
            Revoke a credential by Student ID.
          </CardDescription>
        </CardHeader>
        <CardContent>
                <form onSubmit={handleRevokeCredential} className="space-y-4">
                    <div>
                        <Label htmlFor="revokeId">Credential ID</Label>
                        <Input 
                            id="revokeId" 
                            type="text" 
                            value={revokeId} 
                            onChange={(e) => setRevokeId(e.target.value)} 
                            placeholder="0x... or student.eth" 
                        />
                    </div>
                    <Button 
                        type="submit" 
                        disabled={isRevoking} 
                    >
                        {isRevoking ? 'Processing...' : 'Revoke Credential'}
                    </Button>
                </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                {revokeMessage && (
                  <Alert variant={revokeMessage.type === 'error' ? 'destructive' : 'default'}>
                    
                        {revokeMessage.type === 'success' && <CheckCircle className="h-4 w-4" />}
                        {revokeMessage.type === 'error' && <AlertCircle className="h-4 w-4" />}
                        {revokeMessage.type === 'info' && <Info className="h-4 w-4" />}
                        <AlertTitle>
            {
              {
                success: 'Success',
                error: 'Error',
                info: 'Information',
              }[revokeMessage.type]
            }
          </AlertTitle>
          <AlertDescription>{revokeMessage.text}</AlertDescription>
                </Alert>
                )}
                </CardFooter>
</Card>
</TabsContent>
</TabsContents>


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
                <Loader2 className="h-5 w-5 animate-spin" />
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
            <div className="bg-purple-50 p-4 rounded-lg prose prose-purple max-w-none text-red-800 focus:text-black-500">
              {/* This is a simple way to render markdown. For safety, `marked` is better */}
              <div dangerouslySetInnerHTML={{ __html: marked(geminiSuggestions) }} />
            </div>
          )}
        </div>
      )}
    </Tabs>
  );
};