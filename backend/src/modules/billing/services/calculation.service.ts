export interface InputCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  gstPercentage: number;
  itemType: 'KITCHEN' | 'PACKED';
}

export interface CalculationResult {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  gstAmount: number;
  roundOff: number;
  grandTotal: number;
  kitchenItemsCount: number;
  packedItemsCount: number;
}

export class CalculationService {
  /**
   * Calculates order totals. GST is no longer applied per client request.
   * gstAmount is always 0. Total = subtotal - discount (rounded).
   * DB column gstAmount is preserved but always stored as 0.
   */
  static calculateBill(
    items: InputCartItem[],
    discountPercentage: number = 0,
    _taxInclusive: boolean = true  // retained for API compatibility, not used
  ): CalculationResult {
    // Assert validations
    if (discountPercentage < 0 || discountPercentage > 100) {
      throw new Error('Discount percentage must be between 0 and 100');
    }

    let subtotal = 0;
    let kitchenItemsCount = 0;
    let packedItemsCount = 0;

    items.forEach((item) => {
      if (item.price < 0) throw new Error('Item price cannot be negative');
      if (item.quantity < 0) throw new Error('Item quantity cannot be negative');

      subtotal += item.price * item.quantity;
      if (item.itemType === 'KITCHEN') {
        kitchenItemsCount += item.quantity;
      } else {
        packedItemsCount += item.quantity;
      }
    });

    const discountAmount = Number(((subtotal * discountPercentage) / 100).toFixed(2));
    const netAmount = subtotal - discountAmount;

    // GST removed per client request — always 0
    const gstAmount = 0;
    const taxableAmount = Number(netAmount.toFixed(2));

    const calculatedGrandTotal = taxableAmount; // no GST added
    const roundedGrandTotal = Math.round(calculatedGrandTotal);
    const roundOff = Number((roundedGrandTotal - calculatedGrandTotal).toFixed(2));

    return {
      subtotal: Number(subtotal.toFixed(2)),
      discountAmount,
      taxableAmount,
      gstAmount,
      roundOff,
      grandTotal: roundedGrandTotal,
      kitchenItemsCount,
      packedItemsCount,
    };
  }
}

