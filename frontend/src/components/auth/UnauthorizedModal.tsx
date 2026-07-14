import { ShieldAlert } from 'lucide-react';
import { Button } from '../ui/button';

interface UnauthorizedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UnauthorizedModal = ({ isOpen, onClose }: UnauthorizedModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-xl shadow-xl text-center">
        <ShieldAlert className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Permission Denied</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          You lack the required security permission rules to load this resource or settings.
        </p>
        <Button onClick={onClose} className="mt-6 w-full">
          Dismiss
        </Button>
      </div>
    </div>
  );
};
export default UnauthorizedModal;
