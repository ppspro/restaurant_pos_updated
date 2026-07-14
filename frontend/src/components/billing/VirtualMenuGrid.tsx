import React, { useMemo, useRef, useState, useCallback, useEffect, memo } from 'react';
import { useBillingStore } from '../../store/billing.store';
import { MenuCard } from './MenuCard';
import { Utensils } from 'lucide-react';

/**
 * VirtualMenuGrid renders only visible rows of menu cards.
 *
 * Why this matters:
 * A restaurant menu with 300 items rendered as a 4-column grid = 75 rows.
 * Without virtualisation every row has full DOM presence (4 card components × 75 rows).
 * With a 600px container only ~5 rows are visible — we render ~8 (with overscan)
 * instead of 75, reducing initial DOM nodes by ~90%.
 *
 * Implementation uses a manual overscan window-based approach:
 * no external virtualisation library needed.
 */

const CARD_HEIGHT = 160;   // px — approximate MenuCard height
const COLUMNS = 4;         // grid columns (matches lg:grid-cols-4)
const OVERSCAN_ROWS = 2;   // extra rows rendered above/below viewport

interface VirtualMenuGridProps {
  containerHeight?: number;
}

export const VirtualMenuGrid = memo(({ containerHeight = 600 }: VirtualMenuGridProps) => {
  const menuItems = useBillingStore((state) => state.menuItems);
  const selectedCategoryId = useBillingStore((state) => state.selectedCategoryId);
  const searchQuery = useBillingStore((state) => state.searchQuery);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Filtered items — memoised same as MenuGrid
  const filtered = useMemo(() => {
    return menuItems.filter((item) => {
      if (selectedCategoryId === 'favorites') {
        if (!item.isFeatured && !item.isPopular) return false;
      } else if (selectedCategoryId && item.categoryId !== selectedCategoryId) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.shortCode.toLowerCase().includes(q) ||
          (item.barcode ?? '').includes(q)
        );
      }
      return true;
    });
  }, [menuItems, selectedCategoryId, searchQuery]);

  // Scroll handler — throttled with requestAnimationFrame
  const rafRef = useRef<number>(0);
  const handleScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      setScrollTop(scrollRef.current?.scrollTop ?? 0);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50/50 dark:bg-gray-950/20 border border-dashed rounded-xl h-64 text-center">
        <Utensils className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2 animate-pulse" />
        <p className="text-sm font-semibold text-gray-500">No items found</p>
        <p className="text-xs text-gray-400 mt-1">Try a different category or search term</p>
      </div>
    );
  }

  // Layout calculations
  const totalRows = Math.ceil(filtered.length / COLUMNS);
  const totalHeight = totalRows * CARD_HEIGHT;

  const firstVisibleRow = Math.max(0, Math.floor(scrollTop / CARD_HEIGHT) - OVERSCAN_ROWS);
  const visibleRowCount = Math.ceil(containerHeight / CARD_HEIGHT) + OVERSCAN_ROWS * 2;
  const lastVisibleRow = Math.min(totalRows - 1, firstVisibleRow + visibleRowCount);

  const visibleItems = filtered.slice(firstVisibleRow * COLUMNS, (lastVisibleRow + 1) * COLUMNS);
  const offsetY = firstVisibleRow * CARD_HEIGHT;

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      style={{ height: containerHeight, overflowY: 'auto', position: 'relative' }}
      className="pr-1"
    >
      {/* Total height placeholder keeps scrollbar accurate */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Only visible items are rendered */}
        <div
          style={{ transform: `translateY(${offsetY}px)` }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
        >
          {visibleItems.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
});
VirtualMenuGrid.displayName = 'VirtualMenuGrid';
export default VirtualMenuGrid;
