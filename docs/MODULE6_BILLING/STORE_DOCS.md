# Billing Store Documentation

The POS system uses Zustand (`frontend/src/store/billing.store.ts`) for state management, providing highly optimized, un-opinionated state updates for the billing interface.

## Overview
The `billing.store.ts` file acts as the single source of truth for:
1. Active Cart State (items, quantities, instructions).
2. UI Search & Category filters.
3. Discount State.
4. Transient payment state.
5. Cached Order History for the current session.

## Core Interfaces

### `CartItem`
Extends the base `MenuItem` to include context-specific checkout data.
```typescript
interface CartItem extends MenuItem {
  quantity: number;
  instructions?: string; // Optional kitchen notes (e.g. "Less spicy")
}
```

## State Actions

- **`addToCart(item: MenuItem)`**: Adds an item. If it exists, increments quantity.
- **`removeFromCart(id: string)`**: Removes the item completely and saves it to `lastRemovedItem` to allow undo.
- **`undoLastRemove()`**: Restores the accidentally deleted item.
- **`updateQuantity(id: string, qty: number)`**: Hard-sets quantity. If qty falls below 1, removes the item.
- **`applyDiscount(type: 'PERCENTAGE' | 'FLAT', value: number, reason: string)`**: Sets the discount configuration. Total derivations happen in the View layer (Cart.tsx).
- **`addCompletedOrder(order: CompletedOrder)`**: Pushes a finished order to the top of the history stack (max 20 items stored).

## Persistence
Zustand's `persist` middleware is used.
- **Storage Key**: `pos-checkout-storage-v5`
- **Cached properties**: The `cart`, `discount`, and `completedOrders` array survive hard page refreshes, ensuring a cashier does not lose an active order if their browser crashes.

## Performance Note
Selectors are heavily utilized in the React components to prevent unrelated state changes from triggering global re-renders. (e.g. `useBillingStore(state => state.addToCart)` instead of destructuring the whole store hook).
