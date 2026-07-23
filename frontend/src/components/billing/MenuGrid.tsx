import React, { useMemo } from 'react';
import { useBillingStore } from '../../store/billing.store';
import { MenuCard } from './MenuCard';
import { QuickSelectPopup } from './QuickSelectPopup';
import { Utensils } from 'lucide-react';
import { useQuickSelect } from '../../hooks/useQuickSelect';

/**
 * MenuGrid uses useMemo to derive the filtered item list.
 * Without memoization, every cart update (qty change, item add)
 * triggers the full filter pass over all menu items — wasted CPU.
 *
 * The dependency array [menuItems, selectedCategoryId, searchQuery]
 * ensures the filter only re-runs when these values actually change.
 */
export const MenuGrid = () => {
  const menuItems = useBillingStore((state) => state.menuItems);
  const selectedCategoryId = useBillingStore((state) => state.selectedCategoryId);
  const searchQuery = useBillingStore((state) => state.searchQuery);

  const filtered = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      if (selectedCategoryId === 'favorites') {
        if (!item.isFeatured && !item.isPopular) return false;
      } else if (selectedCategoryId && item.categoryId !== selectedCategoryId) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          item.name.toLowerCase().includes(q) ||
          item.itemNumber?.toLowerCase().includes(q) ||
          item.shortCode.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          (item.barcode && item.barcode.includes(q))
        );
      }

      return true;
    });
  }, [menuItems, selectedCategoryId, searchQuery]);

  const { buffer, selectedItem, isOpen } = useQuickSelect(filtered);

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50/50 dark:bg-gray-950/20 border border-dashed rounded-xl h-64 text-center">
        <Utensils className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2 animate-pulse" />
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No items found</p>
        <p className="text-xs text-gray-400 mt-1">Try a different category or search term</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pr-1 overflow-y-auto max-h-[calc(100vh-12rem)] pb-4">
        {filtered.map((item, index) => (
          <MenuCard key={item.id} item={item} referenceNumber={index + 1} />
        ))}
      </div>
      <QuickSelectPopup isOpen={isOpen} buffer={buffer} selectedItem={selectedItem} />
    </>
  );
};
export default MenuGrid;
