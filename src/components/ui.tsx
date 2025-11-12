// ui.tsx

import type { FC } from 'react'; // Import FC as a type-only import
// 'React' import removed as it's not needed

export const LoadingSpinner: FC = () => (
  <div className="flex justify-center items-center">
    {/* Use a smaller spinner to match button text size */}
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
  </div>
);

// Define props for the AlertBox
interface AlertBoxProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

export const AlertBox: FC<AlertBoxProps> = ({ type, message, onClose }) => {
  const colors = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200'
  };

  return (
    <div className={`rounded-lg p-4 border ${colors[type]} mb-4 flex justify-between items-start`}>
      <div className="flex-1">{message}</div>
      {onClose && (
        <button 
          onClick={onClose} 
          className="ml-4 text-gray-400 hover:text-gray-600"
          aria-label="Close alert"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};