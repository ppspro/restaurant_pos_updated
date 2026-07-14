import React, { useState } from 'react';
import { Button } from '../ui/button';

interface Terminal {
  id: string;
  terminalCode: string;
  terminalName: string;
  location: string | null;
  status: string;
}

interface TerminalSelectionProps {
  isOpen: boolean;
  terminals: Terminal[];
  onSelect: (terminalId: string) => void;
}

export const TerminalSelection = ({ isOpen, terminals, onSelect }: TerminalSelectionProps) => {
  const [selectedId, setSelectedId] = useState<string>('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-xl shadow-xl">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Select POS Terminal</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Identify your current physical workstation. Only one cashier session can claim a terminal at a time.
        </p>

        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-1">
          {terminals.map((t) => {
            const isBusy = t.status === 'BUSY';
            return (
              <label
                key={t.id}
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition ${
                  selectedId === t.id
                    ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-900/10'
                    : isBusy
                    ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-950'
                    : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/55'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="terminal"
                    value={t.id}
                    disabled={isBusy}
                    checked={selectedId === t.id}
                    onChange={() => setSelectedId(t.id)}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div>
                    <span className="block text-sm font-semibold text-gray-950 dark:text-white">
                      {t.terminalName} ({t.terminalCode})
                    </span>
                    {t.location && (
                      <span className="block text-xs text-gray-500 dark:text-gray-400">{t.location}</span>
                    )}
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    isBusy
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  }`}
                >
                  {t.status}
                </span>
              </label>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button disabled={!selectedId} onClick={() => onSelect(selectedId)} className="w-full">
            Claim Workstation
          </Button>
        </div>
      </div>
    </div>
  );
};
export default TerminalSelection;
