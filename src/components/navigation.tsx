// navigation.tsx

import type { FC } from 'react'; // 'React' import removed, FC is type-only

// Props for RoleIndicator
interface RoleIndicatorProps {
  isOwner: boolean;
  isUniversity: boolean;
}

export const RoleIndicator: FC<RoleIndicatorProps> = ({ isOwner, isUniversity }) => {
  let role = 'Student/Verifier';
  let color = 'bg-gray-100 text-gray-800';
  let icon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  if (isOwner) {
    role = 'Admin';
    color = 'bg-purple-100 text-purple-800';
    icon = (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    );
  } else if (isUniversity) {
    role = 'University';
    color = 'bg-blue-100 text-blue-800';
    icon = (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    );
  }

  return (
    <div className={`hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full ${color}`}>
      {icon}
      <span className="text-sm font-medium">{role}</span>
    </div>
  );
};

// Props for NetworkStatus
interface NetworkStatusProps {
  chainId: string | null | undefined; // Allow chainId to be null or undefined
}

export const NetworkStatus: FC<NetworkStatusProps> = ({ chainId }) => {
  // Add network names as needed
  const networks: { [key: string]: string } = {
    '0x1': 'Ethereum',
    '0x5': 'Goerli',
    '0xaa36a7': 'Sepolia', // This is the one you seem to be using
    '0x89': 'Polygon',
    '0x13881': 'Mumbai',
  };

  const network = chainId ? (networks[chainId] || 'Unknown Network') : 'Not Connected';
  
  return (
    <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
      <div className={`w-2 h-2 ${chainId ? 'bg-green-500' : 'bg-red-500'} rounded-full`}></div>
      <span>{network}</span>
    </div>
  );
};