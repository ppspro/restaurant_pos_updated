import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';

type Permission = { id: string; code: string; description?: string };
type RolePermission = { permission: Permission };
type Role = { id: string; name: string; permissions: RolePermission[] };

export default function RoleManagement() {
  const queryClient = useQueryClient();
  const [matrix, setMatrix] = useState<Record<string, Record<string, boolean>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const matrixRef = useRef(matrix);

  const { data: roles = [], isLoading: isLoadingRoles } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: adminApi.getRoles,
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: permissions = [], isLoading: isLoadingPermissions } = useQuery<Permission[]>({
    queryKey: ['permissions'],
    queryFn: adminApi.getAllPermissions,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (roles.length > 0 && permissions.length > 0 && Object.keys(matrixRef.current).length === 0) {
      const initialMatrix: Record<string, Record<string, boolean>> = {};
      roles.forEach(role => {
        initialMatrix[role.name] = {};
        const rolePermCodes = new Set(role.permissions.map(p => p.permission.code));
        permissions.forEach(perm => {
          initialMatrix[role.name][perm.code] = rolePermCodes.has(perm.code);
        });
      });
      setMatrix(initialMatrix);
      matrixRef.current = initialMatrix;
    }
  }, [roles, permissions]);

  const toggle = (roleName: string, code: string) => {
    if (roleName === 'SUPER_ADMIN') return;
    const newMatrix = {
      ...matrix,
      [roleName]: { ...matrix[roleName], [code]: !matrix[roleName][code] }
    };
    setMatrix(newMatrix);
    matrixRef.current = newMatrix;
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const currentMatrix = matrixRef.current;
      const updatableRoles = roles.filter(r => r.name !== 'SUPER_ADMIN');
      
      for (const role of updatableRoles) {
        const selectedPerms = permissions.filter(p => currentMatrix[role.name]?.[p.code]);
        const permissionIds = selectedPerms.map(p => p.id);
        await adminApi.updateRolePermissions(role.id, permissionIds);
      }
      
      await queryClient.invalidateQueries({ queryKey: ['roles'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save permissions', error);
      alert('Failed to save permissions. Please check console.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingRoles || isLoadingPermissions) {
    return <div className="p-8 flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }


  return (
    <div className="p-8 space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest text-blue-500 uppercase">Access Policies</span>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white mt-1">Role & Permissions</h1>
          <p className="text-muted-foreground text-sm">Configure granular employee role permissions across the POS platform.</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="h-10 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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
                  {roles.map(role => (
                    <th key={role.id} className="p-4 text-center text-[10px] font-extrabold uppercase tracking-wider">
                      <span className={`px-3 py-1 rounded-full ${
                        role.name === 'SUPER_ADMIN'
                          ? 'text-amber-500 bg-amber-500/10 border border-amber-500/20'
                          : 'text-gray-500 bg-gray-100 dark:bg-slate-800'
                      }`}>
                        {role.name.replace('_', ' ')}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {permissions.map(perm => (
                  <tr key={perm.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-gray-900 dark:text-white">{perm.description || perm.code}</p>
                      <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{perm.code}</p>
                    </td>
                    {roles.map(role => (
                      <td key={role.id} className="p-4 text-center">
                        <button
                          onClick={() => toggle(role.name, perm.code)}
                          disabled={role.name === 'SUPER_ADMIN' || isSaving}
                          className={`w-7 h-7 rounded-xl mx-auto flex items-center justify-center transition-all ${
                            matrix[role.name]?.[perm.code]
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : 'bg-gray-100 dark:bg-slate-800 text-gray-400'
                          } ${role.name === 'SUPER_ADMIN' ? 'cursor-not-allowed opacity-60' : 'hover:scale-105 cursor-pointer'}`}
                        >
                          {matrix[role.name]?.[perm.code] ? '✓' : '✕'}
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
