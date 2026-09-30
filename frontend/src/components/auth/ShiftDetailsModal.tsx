import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { FileText } from 'lucide-react';
import { api } from '../../api/axios';

export const ShiftDetailsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [shift, setShift] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError('');
      api.get('/auth/shifts/current')
        .then(res => setShift(res.data.data))
        .catch(err => setError(err.response?.data?.message || 'Failed to load shift details.'))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-6 w-[450px] max-w-[90vw] animate-fade-in-up">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          Shift Details
        </h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <p className="text-red-500 text-sm font-semibold p-4 bg-red-50 rounded-lg">{error}</p>
        ) : shift ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Terminal</p>
                <p className="font-semibold text-gray-900 dark:text-white">{shift.terminal?.code || 'N/A'}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Status</p>
                <p className="font-semibold text-gray-900 dark:text-white">{shift.status}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Start Time</p>
                <p className="font-semibold text-gray-900 dark:text-white">{new Date(shift.startTime).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Opening Cash</p>
                <p className="font-semibold text-gray-900 dark:text-white">INR {Number(shift.openingCash).toFixed(2)}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl col-span-2">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Business Day</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {shift.businessDay?.businessDate ? new Date(shift.businessDay.businessDate).toLocaleDateString() : 'N/A'} 
                  ({shift.businessDay?.status || 'N/A'})
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No active shift found.</p>
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
