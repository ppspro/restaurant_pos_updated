import React, { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Key, ShieldAlert, Plus, RefreshCw, Trash2, ShieldCheck, Copy } from 'lucide-react';

interface RecoveryKeyData {
  id: string;
  label: string;
  usedAt: string | null;
  isRevoked: boolean;
  createdAt: string;
}

export default function RecoveryKeys() {
  const [keys, setKeys] = useState<RecoveryKeyData[]>([]);
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [newKeyPlaintext, setNewKeyPlaintext] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchKeys = async () => {
    try {
      const res = await api.get('/admin/recovery-keys');
      setKeys(res.data.data);
    } catch (e) {
      console.error('Failed to fetch keys', e);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleGenerate = async () => {
    if (!label) {
      setError('Label is required');
      return;
    }
    setLoading(true);
    setError('');
    setNewKeyPlaintext(null);
    try {
      const res = await api.post('/admin/recovery-keys', { label });
      setNewKeyPlaintext(res.data.data.plaintextKey);
      setLabel('');
      fetchKeys();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to generate key');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await api.delete(`/admin/recovery-keys/${id}`);
      fetchKeys();
    } catch (e) {
      console.error('Failed to revoke key', e);
    }
  };

  const copyToClipboard = () => {
    if (newKeyPlaintext) {
      navigator.clipboard.writeText(newKeyPlaintext);
      alert('Copied to clipboard!');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="text-blue-500 h-6 w-6" />
            Backup & Recovery Keys
          </h1>
          <p className="text-sm text-gray-500">Generate secure offline recovery keys for admin access in emergency scenarios.</p>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 border rounded-xl shadow-sm space-y-4">
        <h3 className="font-semibold text-sm">Generate New Key</h3>
        <div className="flex gap-2">
          <Input 
            placeholder="Key Label (e.g., 'Manager USB Backup')" 
            value={label} 
            onChange={e => setLabel(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={handleGenerate} disabled={loading || !label} className="flex gap-2">
            <Plus className="h-4 w-4" />
            Generate
          </Button>
        </div>
        {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
      </div>

      {newKeyPlaintext && (
        <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-3">
          <h3 className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Key Generated Successfully!
          </h3>
          <p className="text-sm text-emerald-700 dark:text-emerald-500">
            Please copy this key immediately and store it in a secure location. <strong>It will never be shown again!</strong>
          </p>
          <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-900 border rounded-lg font-mono text-sm shadow-inner">
            <span className="flex-1 break-all">{newKeyPlaintext}</span>
            <Button variant="outline" size="sm" onClick={copyToClipboard} className="shrink-0 flex gap-2">
              <Copy className="h-4 w-4" /> Copy
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 border-b">
            <tr>
              <th className="px-4 py-3 font-semibold">Label</th>
              <th className="px-4 py-3 font-semibold">Created</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {keys.map(k => (
              <tr key={k.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                <td className="px-4 py-3 font-medium flex items-center gap-2">
                  <Key className="h-4 w-4 text-slate-400" />
                  {k.label}
                </td>
                <td className="px-4 py-3 text-slate-500">{new Date(k.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  {k.isRevoked ? (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-[10px] font-bold">REVOKED</span>
                  ) : k.usedAt ? (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-[10px] font-bold">USED</span>
                  ) : (
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold">ACTIVE</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {!k.isRevoked && (
                    <Button variant="ghost" size="sm" onClick={() => handleRevoke(k.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      Revoke
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {keys.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  No recovery keys generated yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
