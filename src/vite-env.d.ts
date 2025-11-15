/// <reference types="vite/client" />

interface Eip6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

interface Eip6963Provider {
  isMetaMask?: boolean;
  request: (...args: any[]) => Promise<any>;
  on: (event: string, listener: (...args: any[]) => void) => this;
  removeListener: (event: string, listener: (...args: any[]) => void) => this;
}