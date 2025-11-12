"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Building, GraduationCap, Download, Share2, Eye, ExternalLink } from "lucide-react"
import Link from "next/link"

interface CredentialCardProps {
  credential: {
    id: string
    credentialType: string
    institution: string
    studentName: string
    issueDate: string
    grade: string
    ipfsHash: string
    transactionHash: string
    status: "verified" | "pending"
  }
  onDownload?: (credential: any) => void
  onShare?: (credential: any) => void
}

export function CredentialCard({ credential, onDownload, onShare }: CredentialCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const openInExplorer = () => {
    window.open(`https://sepolia.etherscan.io/tx/${credential.transactionHash}`, "_blank")
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight mb-2">{credential.credentialType}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <Building className="w-4 h-4" />
              {credential.institution}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(credential.status)}>{credential.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-gray-500" />
            <span className="font-medium">Grade: {credential.grade}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>Issued: {new Date(credential.issueDate).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-gray-500">
            <p className="font-medium">IPFS Hash:</p>
            <p className="font-mono break-all bg-gray-50 p-2 rounded text-xs">{credential.ipfsHash}</p>
          </div>
          <div className="text-xs text-gray-500">
            <p className="font-medium">Transaction:</p>
            <div className="flex items-center gap-1">
              <p className="font-mono">
                {credential.transactionHash.slice(0, 10)}...{credential.transactionHash.slice(-8)}
              </p>
              <Button variant="ghost" size="sm" className="h-auto p-1" onClick={openInExplorer}>
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {onDownload && (
            <Button size="sm" variant="outline" onClick={() => onDownload(credential)} className="flex-1">
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
          )}
          {onShare && (
            <Button size="sm" variant="outline" onClick={() => onShare(credential)} className="flex-1">
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          )}
          <Link href={`/verify?hash=${credential.ipfsHash}`}>
            <Button size="sm" variant="outline">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
