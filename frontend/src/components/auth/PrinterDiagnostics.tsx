import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Loader2, Printer, CheckCircle, AlertTriangle } from 'lucide-react';

interface PrinterInfo {
  id: string;
  printerName: string;
  printerType: string;
  paperWidth: string;
  location: string;
  status: string;
}

interface PrinterDiagnosticsProps {
  isOpen: boolean;
  printers: PrinterInfo[];
  onTestPrint: (printerId: string) => Promise<{ success: boolean; diagnostic: string }>;
  onClose: () => void;
}

export const PrinterDiagnostics = ({ isOpen, printers, onTestPrint, onClose }: PrinterDiagnosticsProps) => {
  const [testingId, setTestingId] = useState<string>('');
  const [result, setResult] = useState<string>('');

  if (!isOpen) return null;

  const handleTest = async (printerId: string) => {
    setTestingId(printerId);
    setResult('');
    try {
      const resp = await onTestPrint(printerId);
      setResult(resp.diagnostic);
    } catch (e: any) {
      setResult(`Print test failed: ${e.message || 'Network Timeout'}`);
    } finally {
      setTestingId('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-xl shadow-xl">
        <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Printer className="h-5 w-5 text-blue-500" />
            Printer Connectivity Diagnostics
          </h3>
        </div>

        <div className="mt-4 space-y-3 max-h-64 overflow-y-auto pr-1">
          {printers.map((p) => {
            const isTesting = testingId === p.id;
            return (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 border border-gray-150 dark:border-gray-800 rounded-lg bg-gray-50/50 dark:bg-gray-950/20"
              >
                <div>
                  <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                    {p.printerName}
                  </span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    Location: {p.location} | Width: {p.paperWidth} | Type: {p.printerType}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      p.status === 'ONLINE'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}
                  >
                    {p.status === 'ONLINE' ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <AlertTriangle className="h-3 w-3" />
                    )}
                    {p.status}
                  </span>
                  <Button
                    size="sm"
                    disabled={isTesting}
                    onClick={() => handleTest(p.id)}
                    className="h-8 px-3"
                  >
                    {isTesting ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : 'Test'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {result && (
          <div className="mt-4 p-3 rounded-lg border border-blue-100 bg-blue-50/20 text-xs text-blue-800 dark:border-blue-900/30 dark:text-blue-400 font-mono whitespace-pre-wrap leading-relaxed">
            {result}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="outline" className="w-full">
            Close Diagnostics
          </Button>
        </div>
      </div>
    </div>
  );
};
export default PrinterDiagnostics;
