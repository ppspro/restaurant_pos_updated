import React, { useState, useEffect, useRef } from 'react';
import { Search, Clock, Calendar, User, Scan, History, ArrowRight } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useBillingStore } from '../../store/billing.store';

export const BillingHeader = () => {
  const {
    searchQuery,
    setSearchQuery,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    barcodeScan,
  } = useBillingStore();

  const [time, setTime] = useState<string>(new Date().toLocaleTimeString());
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [simulatedBarcode, setSimulatedBarcode] = useState<string>('');
  const [scanStatus, setScanStatus] = useState<string>('');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut listener F1
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside history overlay
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (
        historyRef.current &&
        !historyRef.current.contains(e.target as Node) &&
        searchInputRef.current !== e.target
      ) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      addRecentSearch(searchQuery);
      setShowHistory(false);
    }
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatedBarcode) return;
    const success = barcodeScan(simulatedBarcode);
    if (success) {
      setScanStatus('Success! Item added to cart.');
      setTimeout(() => setScanStatus(''), 2000);
    } else {
      setScanStatus('Failed: Barcode not found.');
      setTimeout(() => setScanStatus(''), 2000);
    }
    setSimulatedBarcode('');
  };

  const simulateRandomScan = () => {
    const mockBarcodes = ['8901234567890', '8901234567893', '8901234567894'];
    const chosen = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
    const success = barcodeScan(chosen);
    if (success) {
      setScanStatus(`Simulated Scan Success: Barcode ${chosen}`);
      setTimeout(() => setScanStatus(''), 2000);
    }
  };

  return (
    <header className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border-b bg-white dark:bg-gray-900 border-gray-150 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-500 text-white rounded-lg font-bold text-lg tracking-wider">
          POS
        </div>
        <div>
          <h1 className="text-md font-bold text-gray-900 dark:text-white">Spice Garden Restaurant</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Terminal: <span className="font-semibold text-gray-700 dark:text-gray-200">T-01</span></p>
        </div>
      </div>

      {/* Center Search / History Drawer */}
      <div className="w-full max-w-md relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search items... (Press F1 to focus)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
            onFocus={() => setShowHistory(true)}
            className="pl-10 h-10 w-full"
          />
        </div>

        {/* Search history drop-down */}
        {showHistory && recentSearches.length > 0 && (
          <div
            ref={historyRef}
            className="absolute left-0 right-0 top-11 bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-xl shadow-xl z-50 p-3 space-y-2 text-xs"
          >
            <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400">
              <span className="flex items-center gap-1">
                <History className="h-3.5 w-3.5" />
                Recent Searches
              </span>
              <button onClick={clearRecentSearches} className="hover:underline">Clear All</button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {recentSearches.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(s);
                    setShowHistory(false);
                  }}
                  className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 rounded-full transition-colors text-gray-700 dark:text-gray-300"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Barcode scanner panel simulation */}
      <div className="flex items-center gap-2">
        <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-1.5">
          <div className="relative w-36">
            <Scan className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              type="text"
              placeholder="Barcode scan..."
              value={simulatedBarcode}
              onChange={(e) => setSimulatedBarcode(e.target.value)}
              className="pl-7 h-8 text-[10px] w-full"
            />
          </div>
          <Button type="submit" size="sm" variant="outline" className="h-8 px-2 text-[10px] font-bold">
            <ArrowRight className="h-3 w-3" />
          </Button>
        </form>
        <Button onClick={simulateRandomScan} size="sm" className="h-8 text-[10px] font-bold shrink-0 bg-blue-500 hover:bg-blue-600">
          Simulate Scan
        </Button>
      </div>

      {/* Live Clock / Cashier */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-950/20 rounded-md border border-gray-100 dark:border-gray-800">
          <Calendar className="h-3.5 w-3.5 text-blue-500" />
          <span>July 10, 2026</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-950/20 rounded-md border border-gray-100 dark:border-gray-800">
          <Clock className="h-3.5 w-3.5 text-green-500" />
          <span className="font-mono">{time}</span>
        </div>
      </div>

      {/* Scan status alert ribbon */}
      {scanStatus && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-blue-500 text-white font-bold text-xs px-4 py-1.5 rounded-full shadow-md animate-fade-in-down">
          {scanStatus}
        </div>
      )}
    </header>
  );
};
export default BillingHeader;
