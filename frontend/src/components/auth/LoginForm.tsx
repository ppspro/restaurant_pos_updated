import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { Eye, EyeOff, Loader2, Lock, User as UserIcon, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginInput = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  
  // Fake locked state logic for UI demonstration, driven by backend error or mock
  const [lockedTimeLeft, setLockedTimeLeft] = useState<number | null>(null);
  
  // Maintenance mode
  const [isMaintenance, setIsMaintenance] = useState(false);

  const { login, error, loading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  const usernameVal = watch('username');
  const passwordVal = watch('password');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (typeof e.getModifierState === 'function') {
        setCapsLockActive(e.getModifierState('CapsLock'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!error) return;
    
    // Check if backend error implies a lock
    if (error.toLowerCase().includes('lock') || error.toLowerCase().includes('attempts')) {
      setLockedTimeLeft(15 * 60);
    } 
    // Check if backend implies maintenance / DB down
    else if (error.toLowerCase().includes('maintenance') || error.toLowerCase().includes('database')) {
      setIsMaintenance(true);
    }
  }, [error]);

  useEffect(() => {
    if (lockedTimeLeft !== null && lockedTimeLeft > 0) {
      const timer = setInterval(() => setLockedTimeLeft(prev => prev! - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [lockedTimeLeft]);

  const onSubmit = (data: LoginInput) => {
    login({
      username: data.username,
      password: data.password,
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  if (isMaintenance) {
    return (
      <div className="flex flex-col items-center justify-center animate-fade-in-up text-center space-y-6 py-4">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-2">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">System Maintenance</h3>
          <p className="text-[15px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px]">
            The system is currently undergoing scheduled maintenance. Please try again later.
          </p>
        </div>
        <button
          onClick={() => {
            setIsMaintenance(false);
            window.location.reload();
          }}
          className="mt-6 flex items-center justify-center w-full h-[50px] rounded-[12px] bg-slate-100 dark:bg-slate-800 text-[14px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  if (lockedTimeLeft !== null && lockedTimeLeft > 0) {
    return (
      <div className="flex flex-col items-center justify-center animate-fade-in-up text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-2">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Account Locked</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Too many failed login attempts.<br />Please try again in:
          </p>
          <div className="text-3xl font-mono font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 py-3 px-6 rounded-xl inline-block border border-red-100 dark:border-red-900/30">
            {formatTime(lockedTimeLeft)}
          </div>
        </div>
        <button
          onClick={() => setLockedTimeLeft(null)}
          className="mt-4 flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 w-full animate-fade-in-up">
      {error && !lockedTimeLeft && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/10 rounded-[14px] text-red-700 dark:text-red-400 animate-fade-in-down border-l-4 border-red-500">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <div className="flex flex-col">
            <h4 className="text-sm font-bold">Authentication Failed</h4>
            <p className="text-sm font-medium leading-relaxed opacity-90">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Username Field */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors z-10">
            <UserIcon className="h-5 w-5" />
          </div>
          <input
            {...register('username')}
            type="text"
            id="username"
            disabled={loading}
            className={`block w-full h-[56px] pl-12 pr-4 pt-4 pb-1 text-[15px] font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-900 border rounded-[14px] appearance-none focus:outline-none focus:ring-[3px] focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm peer disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.username ? 'border-red-300 dark:border-red-700 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
            placeholder=" "
            autoComplete="username"
          />
          <label
            htmlFor="username"
            className={`absolute text-sm duration-300 transform -translate-y-3.5 scale-[0.8] top-[14px] z-10 origin-[0] left-12 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.8] peer-focus:-translate-y-3.5 pointer-events-none
              ${errors.username ? 'text-red-500' : 'text-slate-500 dark:text-slate-400 peer-focus:text-blue-600 dark:peer-focus:text-blue-400'}
            `}
          >
            Username
          </label>
        </div>
        {errors.username && <p className="text-xs font-semibold text-red-500 pl-2">{errors.username.message}</p>}

        {/* Password Field */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors z-10">
            <Lock className="h-5 w-5" />
          </div>
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            id="password"
            disabled={loading}
            className={`block w-full h-[56px] pl-12 pr-12 pt-4 pb-1 text-[15px] font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-900 border rounded-[14px] appearance-none focus:outline-none focus:ring-[3px] focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm peer disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.password ? 'border-red-300 dark:border-red-700 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
            placeholder=" "
            autoComplete="current-password"
          />
          <label
            htmlFor="password"
            className={`absolute text-sm duration-300 transform -translate-y-3.5 scale-[0.8] top-[14px] z-10 origin-[0] left-12 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.8] peer-focus:-translate-y-3.5 pointer-events-none
              ${errors.password ? 'text-red-500' : 'text-slate-500 dark:text-slate-400 peer-focus:text-blue-600 dark:peer-focus:text-blue-400'}
            `}
          >
            Password
          </label>
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors z-10 focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
          {capsLockActive && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-md uppercase tracking-wider">
              Caps Lock
            </div>
          )}
        </div>
        {errors.password && <p className="text-xs font-semibold text-red-500 pl-2">{errors.password.message}</p>}
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <Checkbox 
            {...register('rememberMe')} 
            id="remember-me" 
            disabled={loading}
            className="w-4 h-4 rounded-[4px] border-slate-300 text-blue-600 focus:ring-blue-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 transition-all"
          />
          <label htmlFor="remember-me" className="text-sm font-medium text-slate-600 dark:text-slate-400 select-none cursor-pointer">
            Remember me
          </label>
        </div>
        <button
          type="button"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors focus:outline-none hover:underline"
        >
          Forgot password?
        </button>
      </div>

      <div className="pt-4">
        <button 
          type="submit" 
          disabled={loading}
          className="relative w-full h-[56px] rounded-[14px] font-bold text-white text-[15px] overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md hover:-translate-y-[1px] active:scale-[0.99]"
        >
          <div className="absolute inset-0 bg-blue-600 transition-colors duration-300 group-hover:bg-blue-700"></div>
          <div className="relative flex items-center justify-center">
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-3" />
                Signing In...
              </>
            ) : (
              'Sign In to Dashboard'
            )}
          </div>
        </button>
      </div>
      
      <div className="pt-2 flex flex-wrap justify-center items-center gap-4 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        <div className="flex items-center gap-1.5"><Lock className="w-3 h-3"/> Secure Login</div>
        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
        <div>256-bit Encryption</div>
      </div>
    </form>
  );
};

export default LoginForm;
