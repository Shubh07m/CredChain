// src/components/StudentVerifierView.tsx

import { useState, useEffect } from 'react';
import type { FC } from 'react';
import type { Contract, BrowserProvider } from 'ethers'; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { ContractCredentialCard } from './ContractCredentialCard';
import type { ContractCredential } from './ContractCredentialCard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { CopyButton } from './ui/shadcn-io/copy-button';

//
// --- ⚠️ ACTION REQUIRED ---
// You must also import your 'callGeminiAPI' function
// import { callGeminiAPI } from '@/lib/gemini';
//
// -------------------------

// Dummy function. Replace with your real import.
const callGeminiAPI = async (prompt: string): Promise<string> => { 
  console.log("Calling mock Gemini API with prompt:", prompt);
  return new Promise(resolve => setTimeout(() => resolve("Mock LinkedIn post..."), 1000));
};

// Define props
interface StudentVerifierViewProps {
  contract: Contract | null;
  account: string | null;
  provider: BrowserProvider | null;
}

export const StudentVerifierView: FC<StudentVerifierViewProps> = ({ contract, account, provider }) => {
  const [myCredentials, setMyCredentials] = useState<ContractCredential[]>([]);
  const [isMyCredsLoading, setIsMyCredsLoading] = useState<boolean>(true);
  const [draftPost, setDraftPost] = useState<string>('');
  const [isDrafting, setIsDrafting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>(''); // State for errors

  useEffect(() => {
    const fetchMyCredentials = async () => {
      setErrorMsg(''); // Clear previous errors
      if (contract && account) {
        setIsMyCredsLoading(true);
        try {
          const ids: bigint[] = await contract.getStudentCredentialIds(account);
          const creds: ContractCredential[] = await Promise.all(ids.map(id => contract.credentials(id)));
          setMyCredentials(creds);
        } catch (err: any) {
          console.error("Error fetching student credentials:", err);
          setErrorMsg("Could not fetch your credentials. Please check the network.");
        } finally {
          setIsMyCredsLoading(false);
        }
      } else {
        setIsMyCredsLoading(false); // Not connected
      }
    };
    fetchMyCredentials();
  }, [contract, account]);

  const handleDraftPost = async (credentialType: string) => {
    setIsDrafting(true);
    setDraftPost('');
    const prompt = `Write a professional and enthusiastic LinkedIn post for a student announcing they have earned a "${credentialType}". Include placeholders like "[University Name]" and suggest relevant hashtags.`;
    const post = await callGeminiAPI(prompt);
    setDraftPost(post);
    setIsDrafting(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draftPost)
      .then(() => {
        // You could add a small "Copied!" visual feedback here
      })
      .catch(err => console.error('Failed to copy text: ', err));
  };

  return (
    <div className="w-full px-4 py-6">
      <div className="mx-auto w-full max-w-md sm:max-w-lg lg:max-w-2xl space-y-4">
      {/* --- This is now the ONLY part of this component --- */}
        <Card className="w-full max-w-2xl md:max-w-3xl bg-black/60 backdrop-blur-2xl text-white border-white/10 shadow-xl">
        <CardHeader>
          <CardTitle>
            My Credentials
          </CardTitle>
        </CardHeader>
        <CardContent>
        
        {errorMsg && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        {isMyCredsLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
        ) : myCredentials.length > 0 ? (
          <div className="mx-auto w-full max-w-md sm:max-w-lg lg:max-w-2xl space-y-4">
            {myCredentials.map(cred => (
              <ContractCredentialCard
                key={cred.id.toString()}
                cred={cred}
                isStudentView={true}
                provider={provider}
                handleDraftPost={handleDraftPost}
                isDrafting={isDrafting}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <Label htmlFor="Creds">No credentials</Label>
            <CardDescription className="mt-1 text-sm text-gray-500">
              No credentials have been issued to your address yet.
            </CardDescription>
          </div>
        )}

        {draftPost && (
          <div className="mt-6 border-t pt-6">
            <Label htmlFor="announcementDraft">
              Your Announcement Draft
            </Label>
            <div className="bg-gray-50 rounded-lg p-4">
              <textarea
                value={draftPost}
                readOnly
                rows={6}
                className="w-full p-2 border rounded-md bg-white"
              />
              <CopyButton 
                onClick={handleCopy}
              />
            </div>
          </div>
        )}
        </CardContent>
        </Card>
      </div>
    </div>
  );
};