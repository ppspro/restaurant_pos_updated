import React, { useEffect } from 'react';
import { BillingHeader } from '../../components/billing/BillingHeader';
import { CategorySidebar } from '../../components/billing/CategorySidebar';
import { MenuGrid } from '../../components/billing/MenuGrid';
import { Cart } from '../../components/billing/Cart';
import { useBillingStore } from '../../store/billing.store';

export const POSWorkspace = () => {
  const fetchCatalog = useBillingStore((state) => state.fetchCatalog);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50/30 dark:bg-gray-950/10">
      {/* Top Header */}
      <BillingHeader />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Category Sidebar */}
        <CategorySidebar />

        {/* Center Menu Grid Catalog */}
        <main className="flex-1 p-4 overflow-y-auto">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Menu Catalog</h2>
            <p className="text-xs text-gray-500">Click items to add to cart. Items tagged KITCHEN route KOT tickets.</p>
          </div>
          <MenuGrid />
        </main>

        {/* Right Shopping Cart Summary */}
        <aside className="w-full md:w-80 p-4 border-l border-gray-150 dark:border-gray-800 md:h-full bg-white dark:bg-gray-900 shrink-0">
          <Cart />
        </aside>
      </div>
    </div>
  );
};
export default POSWorkspace;
