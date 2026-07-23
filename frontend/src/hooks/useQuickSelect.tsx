import { useState, useEffect, useCallback } from 'react';
import { useBillingStore } from '../store/billing.store';
import type { MenuItem } from '../store/billing.store';

export const useQuickSelect = (visibleItems: MenuItem[]) => {
  const [buffer, setBuffer] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const addToCart = useBillingStore((state) => state.addToCart);

  const selectedIndex = parseInt(buffer, 10) - 1;
  const selectedItem =
    !isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex < visibleItems.length
      ? visibleItems[selectedIndex]
      : null;

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (buffer) {
      timeoutId = setTimeout(() => {
        setBuffer('');
        setIsOpen(false);
      }, 1000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [buffer]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if an input field, textarea, or contenteditable is focused
      const activeElement = document.activeElement as HTMLElement;
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.isContentEditable)
      ) {
        return;
      }

      // Ignore modifier keys combinations (e.g. Ctrl+C)
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      if (e.key === 'Escape') {
        if (isOpen || buffer) {
          e.preventDefault();
          setBuffer('');
          setIsOpen(false);
        }
        return;
      }

      if (e.key === 'Backspace') {
        if (buffer.length > 0) {
          e.preventDefault();
          const newBuffer = buffer.slice(0, -1);
          setBuffer(newBuffer);
          if (newBuffer.length === 0) setIsOpen(false);
        }
        return;
      }

      if (e.key === 'Enter') {
        if (isOpen && selectedItem && selectedItem.isAvailable) {
          e.preventDefault();
          addToCart(selectedItem);
          
          // Flash animation
          const flashEvent = new CustomEvent('quick-select-flash', { detail: selectedItem.id });
          window.dispatchEvent(flashEvent);

          // Show Toast (Assuming there's a global toast, but let's just dispatch an event or use a simple visual cue. The flash is already 200ms)
          // We can also trigger a generic toast event or alert if needed.
          
          setBuffer('');
          setIsOpen(false);
        }
        return;
      }

      // If it's a number key
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        setBuffer((prev) => prev + e.key);
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buffer, isOpen, selectedItem, addToCart]);

  return { buffer, selectedItem, isOpen };
};
