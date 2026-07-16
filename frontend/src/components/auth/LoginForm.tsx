import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { Eye, EyeOff, Loader2, Lock, User as UserIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginInput = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, loading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = (data: LoginInput) => {
    login({
      username: data.username,
      password: data.password,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <Label htmlFor="username" className="block mb-2">
          Username
        </Label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <UserIcon className="h-5 w-5" />
          </span>
          <Input
            {...register('username')}
            type="text"
            id="username"
            className={`pl-10 ${errors.username ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
            placeholder="Enter username"
            autoComplete="username"
          />
        </div>
        {errors.username && <p className="mt-1 text-xs text-red-650">{errors.username.message}</p>}
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <Label htmlFor="password">Password</Label>
          <button
            type="button"
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
            disabled
          >
            Forgot Password?
          </button>
        </div>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <Lock className="h-5 w-5" />
          </span>
          <Input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            id="password"
            className={`pl-10 pr-10 ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-xs text-red-650">{errors.password.message}</p>}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Checkbox {...register('rememberMe')} id="remember-me" />
          <Label htmlFor="remember-me" className="ml-2 select-none">
            Remember Me
          </Label>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>
    </form>
  );
};
export default LoginForm;
