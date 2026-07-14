import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isOpen: boolean;
  message?: string;
}

export const LoadingOverlay = ({ isOpen, message = 'Processing...' }: LoadingOverlayProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs">
      <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
      <p className="mt-3 text-sm font-medium text-white select-none">{message}</p>
    </div>
  );
};
export default LoadingOverlay;
