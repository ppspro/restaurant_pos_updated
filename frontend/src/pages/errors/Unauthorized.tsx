import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';

export const Unauthorized = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    // Navigate back or to a default dashboard/billing based on session
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-550 dark:bg-gray-950 p-6">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl shadow-xl text-center">
        <div className="inline-flex p-3 bg-red-50 dark:bg-red-950/30 rounded-full text-red-600 dark:text-red-450 mb-4 animate-pulse">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Access Denied</h1>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          You do not have the required permissions to access this feature. Please contact your administrator if you think this is a mistake.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Button onClick={handleBack} className="w-full justify-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Button onClick={() => navigate('/login')} variant="outline" className="w-full justify-center">
            Return to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
