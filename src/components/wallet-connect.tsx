"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, LogOut, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WalletConnectProps {
  onAccountChange?: (account: string) => void
}

export function WalletConnect({ onAccountChange }: WalletConnectProps) {
  const [account, setAccount] = useState<string>("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [network, setNetwork] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    checkConnection()

    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)
    }

    return () => {
      if (typeof window.ethereum !== "undefined") {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [])

  const checkConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        })
        if (accounts.length > 0) {
          setAccount(accounts[0])
          onAccountChange?.(accounts[0])
          await checkNetwork()
        }
      } catch (error) {
        console.error("Error checking connection:", error)
      }
    }
  }

  const checkNetwork = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        })

        const networks: { [key: string]: string } = {
          "0x1": "Ethereum Mainnet",
          "0xaa36a7": "Sepolia Testnet",
          "0x5": "Goerli Testnet",
          "0x89": "Polygon Mainnet",
        }

        setNetwork(networks[chainId] || `Unknown (${chainId})`)

        // Warn if not on Sepolia
        if (chainId !== "0xaa36a7") {
          toast({
            title: "Wrong Network",
            description: "Please switch to Sepolia Testnet for full functionality",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error checking network:", error)
      }
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setAccount(accounts[0])
      onAccountChange?.(accounts[0])
    } else {
      setAccount("")
      onAccountChange?.("")
    }
  }

  const handleChainChanged = () => {
    checkNetwork()
  }

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      toast({
        title: "MetaMask Required",
        description: "Please install MetaMask to use this DApp",
        variant: "destructive",
      })
      return
    }

    setIsConnecting(true)
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })
      setAccount(accounts[0])
      onAccountChange?.(accounts[0])
      await checkNetwork()

      toast({
        title: "Wallet Connected",
        description: "Successfully connected to MetaMask",
      })
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAccount("")
    setNetwork("")
    onAccountChange?.("")
    toast({
      title: "Wallet Disconnected",
      description: "Successfully disconnected from MetaMask",
    })
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(account)
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    })
  }

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      })
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added, add it
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0xaa36a7",
                chainName: "Sepolia Testnet",
                nativeCurrency: {
                  name: "Sepolia ETH",
                  symbol: "SEP",
                  decimals: 18,
                },
                rpcUrls: ["https://sepolia.infura.io/v3/"],
                blockExplorerUrls: ["https://sepolia.etherscan.io/"],
              },
            ],
          })
        } catch (addError) {
          console.error("Error adding network:", addError)
        }
      }
    }
  }

  if (account) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-end">
          <Badge variant="secondary" className="px-3 py-1 cursor-pointer" onClick={copyAddress}>
            <Copy className="w-3 h-3 mr-1" />
            {`${account.slice(0, 6)}...${account.slice(-4)}`}
          </Badge>
          {network && (
            <span className="text-xs text-gray-500 mt-1">
              {network}
              {network !== "Sepolia Testnet" && (
                <Button variant="link" size="sm" className="h-auto p-0 ml-1 text-xs" onClick={switchToSepolia}>
                  Switch to Sepolia
                </Button>
              )}
            </span>
          )}
        </div>
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <Button variant="ghost" size="sm" onClick={disconnectWallet}>
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={connectWallet} disabled={isConnecting} className="bg-blue-600 hover:bg-blue-700">
      <Wallet className="w-4 h-4 mr-2" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  )
}
