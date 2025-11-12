import React, { useEffect, useState } from "react";
import { MetaMaskSDK } from "@metamask/sdk";

const MetaMaskConnect = () => {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const connectMetaMask = async () => {
      const MMSDK = new MetaMaskSDK({
        dappMetadata: {
          name: "Simple Dapp",
          url: window.location.href,
        },
        infuraAPIKey: "b4ec9bf79b2e449f87a2e35e38647d86",
      });

      const ethereum = MMSDK.getProvider();

      try {
        const accounts = await MMSDK.connect();
        setAccount(accounts[0]);
      } catch (err) {
        console.error("MetaMask connection failed", err);
      }
    };

    connectMetaMask();
  }, []);

  return (
    <div>
      <h2>MetaMask Connect</h2>
      {account ? <p>Connected: {account}</p> : <p>Connecting...</p>}
    </div>
  );
};

export default MetaMaskConnect;