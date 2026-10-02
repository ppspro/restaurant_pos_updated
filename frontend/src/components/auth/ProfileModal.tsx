import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { api } from '../../api/axios';
import { User, Mail, Shield, UserCircle } from 'lucide-react';

export const ProfileModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.get('/auth/me')
        .then(res => {
          setProfileData(res.data.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-6 w-[400px] max-w-[90vw] animate-fade-in-up">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <UserCircle className="w-6 h-6 text-blue-500" />
          My Profile
        </h2>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : profileData ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 font-semibold">Name</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{profileData.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 font-semibold">Username / Email</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{profileData.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <Shield className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 font-semibold">Role</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{profileData.role}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-red-500 text-sm">Failed to load profile data.</p>
        )}

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} className="font-bold rounded-xl">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
