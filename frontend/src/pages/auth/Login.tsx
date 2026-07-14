import LoginForm from '../../components/auth/LoginForm';
import { UtensilsCrossed } from 'lucide-react';

export const Login = () => {
  return (
    <div className="w-full max-w-md p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl transition-all duration-350">
      <div className="flex flex-col items-center mb-8">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400 mb-3">
          <UtensilsCrossed className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Express Diner</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Prepaid Restaurant POS Portal</p>
      </div>

      <LoginForm />
    </div>
  );
};

export default Login;
