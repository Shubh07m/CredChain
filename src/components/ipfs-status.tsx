"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Database, Wifi, WifiOff, RefreshCw } from "lucide-react"

export function IPFSStatus() {
  const [status, setStatus] = useState<{
    localIPFS: boolean
    web3Storage: boolean
    pinata: boolean
    gateways: { url: string; status: boolean }[]
  }>({
    localIPFS: false,
    web3Storage: false,
    pinata: false,
    gateways: [],
  })
  const [isChecking, setIsChecking] = useState(false)

  const checkLocalIPFS = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_IPFS_API_URL || "http://127.0.0.1:5001"
      const response = await fetch(`${apiUrl}/api/v0/version`, {
        method: "POST",
        signal: AbortSignal.timeout(3000),
      })
      return response.ok
    } catch {
      return false
    }
  }

  const checkIPFSStatus = async () => {
    setIsChecking(true)
    try {
      // Check Local IPFS Desktop
      const localIPFSStatus = await checkLocalIPFS()
      
      // Check Web3.Storage
      const web3StorageStatus = !!process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN

      // Check Pinata
      const pinataStatus = !!(process.env.NEXT_PUBLIC_PINATA_API_KEY && process.env.NEXT_PUBLIC_PINATA_SECRET_KEY)

      // Check IPFS gateways (local first)
      const gateways = [
        process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL || "http://127.0.0.1:8080",
        "https://ipfs.io/ipfs/",
        "https://gateway.pinata.cloud/ipfs/",
        "https://cloudflare-ipfs.com/ipfs/",
      ]

      const gatewayStatus = await Promise.all(
        gateways.map(async (url) => {
          try {
            const response = await fetch(`${url}QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme`, {
              method: "HEAD",
              signal: AbortSignal.timeout(5000),
            })
            return { url, status: response.ok }
          } catch {
            return { url, status: false }
          }
        }),
      )

      setStatus({
        localIPFS: localIPFSStatus,
        web3Storage: web3StorageStatus,
        pinata: pinataStatus,
        gateways: gatewayStatus,
      })
    } catch (error) {
      console.error("Error checking IPFS status:", error)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkIPFSStatus()
  }, [])

  const getOverallStatus = () => {
    const hasStorage = status.web3Storage || status.pinata
    const hasGateway = status.gateways.some((g) => g.status)
    return hasStorage && hasGateway
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Database className="w-4 h-4" />
          IPFS Status
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={checkIPFSStatus} disabled={isChecking}>
          <RefreshCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Overall Status</span>
          <Badge variant={getOverallStatus() ? "default" : "destructive"}>
            {getOverallStatus() ? (
              <>
                <Wifi className="w-3 h-3 mr-1" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </>
            )}
          </Badge>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span>Local IPFS</span>
            <Badge variant={status.localIPFS ? "default" : "secondary"} className="text-xs">
              {status.localIPFS ? "Online" : "Offline"}
            </Badge>
          </div>

          <div className="flex justify-between">
            <span>Web3.Storage</span>
            <Badge variant={status.web3Storage ? "default" : "secondary"} className="text-xs">
              {status.web3Storage ? "Configured" : "Not Set"}
            </Badge>
          </div>

          <div className="flex justify-between">
            <span>Pinata</span>
            <Badge variant={status.pinata ? "default" : "secondary"} className="text-xs">
              {status.pinata ? "Configured" : "Not Set"}
            </Badge>
          </div>

          <div className="pt-2 border-t">
            <p className="font-medium mb-1">Gateways</p>
            {status.gateways.map((gateway, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="truncate">{gateway.url.replace("https://", "").split("/")[0]}</span>
                <Badge variant={gateway.status ? "default" : "destructive"} className="text-xs">
                  {gateway.status ? "✓" : "✗"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
