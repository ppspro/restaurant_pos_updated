# Billing Components Documentation

This document describes the key React components in the POS Billing Module. All components are located in `frontend/src/components/billing`.

## 1. POS Dashboard Components

### `Cart.tsx`
The primary logic hub for the POS interface.
- **Responsibilities**: Displays cart items, item quantity adjustments, inline instructions/notes, calculates subtotals/GST/totals, and triggers payment dialogs.
- **State**: Subscribes to `billing.store.ts` for cart contents and discount state.
- **Integration**: Triggers `POST /api/billing/orders` via `handlePaymentSuccess`.

### `MenuGrid.tsx` & `VirtualMenuGrid.tsx`
Displays available menu items in a grid format.
- **Virtualization**: `VirtualMenuGrid` handles catalogs of 200+ items efficiently by rendering only viewport-visible rows using manual requestAnimationFrame scroll calculations.
- **Memoization**: Uses `useMemo` to prevent expensive re-filtering of items during independent cart state updates.

### `MenuCard.tsx`
Individual menu item card inside the grid.
- **Performance**: Wrapped in `React.memo` to eliminate re-renders unless the specific item availability changes.
- **Features**: Displays price, availability badging, item type icons (Kitchen vs. Packed), and adds item to cart on click.

### `LazyImage.tsx`
Zero-dependency lazy-loading image component.
- **Tech**: Uses `IntersectionObserver` to defer fetching item images until they scroll into view.
- **UX**: Displays a fallback SVG or blurred placeholder, fading smoothly to the actual image.

---

## 2. Dialog & Overlay Components

### `PaymentDialog.tsx`
Handles the cashier's checkout workflow.
- **Flow**: Asks the cashier to verify the amount for CASH (calculating return change) or capture Transaction IDs for UPI/CARD.
- **Triggers**: Calls the `onPaymentSuccess` callback, handing control back to `Cart.tsx` to commit the order.

### `DiscountDialog.tsx`
Allows applying manual discounts to the cart.
- **Features**: Supports Flat (₹) or Percentage (%) discounts. Enforces business rules (e.g., flat discounts cannot exceed subtotal).

### `ReceiptPreview.tsx`
A modal displaying the raw thermal printer outputs.
- **Contents**: Customer Copy, Restaurant Copy, and KOT.
- **Integration**: Triggered automatically on order success or manually from the Order History panel.

### `OrderHistory.tsx`
Displays a slide-out or side panel of today's recent orders.
- **Features**: Shows token number, totals, time, and payment method. Provides quick-action buttons for Reprinting and Cancelling orders.
