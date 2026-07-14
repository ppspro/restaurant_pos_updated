import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Save } from 'lucide-react';
import { Button } from '../../components/ui/button';

const ROLES = ['SUPER_ADMIN', 'CASHIER'];

const PERMISSIONS = [
  { code: 'orders.create',    label: 'Create Orders' },
  { code: 'orders.cancel',    label: 'Cancel Orders' },
  { code: 'orders.view',      label: 'View Orders' },
  { code: 'reports.view',     label: 'View Reports' },
  { code: 'reports.export',   label: 'Export Reports' },
  { code: 'inventory.view',   label: 'View Inventory' },
  { code: 'inventory.edit',   label: 'Edit Inventory' },
  { code: 'kitchen.manage',   label: 'Manage Kitchen' },
  { code: 'customers.view',   label: 'View Customers' },
  { code: 'customers.create', label: 'Create Customers' },
  { code: 'admin.access',     label: 'Admin Access' },
];

// Default permission matrix (mock)
const DEFAULT_MATRIX: Record<string, Record<string, boolean>> = {
  'SUPER_ADMIN': Object.fromEntries(PERMISSIONS.map(p => [p.code, true])),
  'CASHIER': {
    'orders.create': true,
    'orders.cancel': false,
    'orders.view': true,
    'reports.view': false,
    'reports.export': false,
    'inventory.view': false,
    'inventory.edit': false,
    'kitchen.manage': false,
    'customers.view': true,
    'customers.create': true,
    'admin.access': false,
  }
};

export default function RoleManagement() {
  const [matrix, setMatrix] = useState(DEFAULT_MATRIX);
  const [saved, setSaved] = useState(false);

  const toggle = (role: string, code: string) => {
    if (role === 'SUPER_ADMIN') return; // Lock SUPER_ADMIN
    setMatrix(prev => ({
      ...prev,
      [role]: { ...prev[role], [code]: !prev[role][code] }
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest text-blue-500 uppercase">Access Policies</span>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white mt-1">Role & Permissions</h1>
          <p className="text-muted-foreground text-sm">Configure granular employee role permissions across the POS platform.</p>
        </div>
        <Button onClick={handleSave} className="h-10 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2">
          <Save className="w-4 h-4" />
          {saved ? 'Matrix Saved!' : 'Save Access Policies'}
        </Button>
      </div>

      <Card className="border border-border bg-card rounded-2xl overflow-hidden shadow-sm">
        <CardHeader className="border-b border-border bg-slate-50/50 dark:bg-slate-950/20">
          <CardTitle className="text-sm font-bold text-gray-900 dark:text-white">Permission Matrix</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="p-4 text-[10px] uppercase tracking-wider font-extrabold w-64">
                    Permission Scope
                  </th>
                  {ROLES.map(role => (
                    <th key={role} className="p-4 text-center text-[10px] font-extrabold uppercase tracking-wider">
                      <span className={`px-3 py-1 rounded-full ${
                        role === 'SUPER_ADMIN'
                          ? 'text-amber-500 bg-amber-500/10 border border-amber-500/20'
                          : 'text-gray-500 bg-gray-100 dark:bg-slate-800'
                      }`}>
                        {role}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {PERMISSIONS.map(perm => (
                  <tr key={perm.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-gray-900 dark:text-white">{perm.label}</p>
                      <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{perm.code}</p>
                    </td>
                    {ROLES.map(role => (
                      <td key={role} className="p-4 text-center">
                        <button
                          onClick={() => toggle(role, perm.code)}
                          disabled={role === 'SUPER_ADMIN'}
                          className={`w-7 h-7 rounded-xl mx-auto flex items-center justify-center transition-all ${
                            matrix[role]?.[perm.code]
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : 'bg-gray-100 dark:bg-slate-800 text-gray-400'
                          } ${role === 'SUPER_ADMIN' ? 'cursor-not-allowed opacity-60' : 'hover:scale-105 cursor-pointer'}`}
                        >
                          {matrix[role]?.[perm.code] ? '✓' : '✕'}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
