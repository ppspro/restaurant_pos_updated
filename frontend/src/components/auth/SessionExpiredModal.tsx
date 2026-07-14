import { Clock } from 'lucide-react';
import { Button } from '../ui/button';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onLoginAgain: () => void;
}

export const SessionExpiredModal = ({ isOpen, onLoginAgain }: SessionExpiredModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-xl shadow-xl text-center">
        <Clock className="h-10 w-10 text-amber-500 mx-auto mb-4 animate-bounce" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Session Expired</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Your active session has expired for security. Please sign in again to access the POS billing dashboard.
        </p>
        <Button onClick={onLoginAgain} className="mt-6 w-full">
          Sign In Again
        </Button>
      </div>
    </div>
  );
};
export default SessionExpiredModal;
