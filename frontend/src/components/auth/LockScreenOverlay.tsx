import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Lock } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { api } from '../../api/axios';

export const LockScreenOverlay = ({ onUnlock }: { onUnlock: () => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const user = useAuthStore(state => state.user);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Re-authenticate to unlock
      await api.post('/auth/login', { username: user?.username, password });
      onUnlock();
    } catch (err: any) {
      setError('Incorrect password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/95 backdrop-blur-xl">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl w-[400px] max-w-[90vw] text-center animate-fade-in-up">
        <div className="mx-auto w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">POS Locked</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
          Session locked for <strong className="text-gray-700 dark:text-gray-200">{user?.name}</strong>. Enter your password to resume.
        </p>

        {error && (
          <div className="mb-4 text-red-500 text-sm font-semibold bg-red-500/10 py-2 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleUnlock} className="space-y-4">
          <Input
            type="password"
            placeholder="Enter password..."
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full text-center tracking-widest text-lg"
            autoFocus
            required
          />
          <Button type="submit" className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 rounded-xl" disabled={loading}>
            {loading ? 'Unlocking...' : 'Unlock POS'}
          </Button>
        </form>
      </div>
    </div>
  );
};
