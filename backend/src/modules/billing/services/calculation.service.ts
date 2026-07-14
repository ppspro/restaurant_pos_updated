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
   * Calculates order totals considering tax inclusive/exclusive configurations
   */
  static calculateBill(
    items: InputCartItem[],
    discountPercentage: number = 0,
    taxInclusive: boolean = true
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

    let taxableAmount = 0;
    let gstAmount = 0;

    if (taxInclusive) {
      // For inclusive, the price already contains the tax
      // taxableAmount = netAmount / (1 + gstRate)
      // gstAmount = netAmount - taxableAmount
      // We assume a uniform tax rate on the net amount based on average tax or item-level math.
      // To keep it robust, let's aggregate item-level tax math.
      let totalTax = 0;
      items.forEach((item) => {
        const itemSubtotal = item.price * item.quantity;
        const itemDiscount = (itemSubtotal * discountPercentage) / 100;
        const itemNet = itemSubtotal - itemDiscount;

        const taxRate = item.gstPercentage / 100;
        const itemTaxable = itemNet / (1 + taxRate);
        const itemTax = itemNet - itemTaxable;

        totalTax += itemTax;
      });
      gstAmount = Number(totalTax.toFixed(2));
      taxableAmount = Number((netAmount - gstAmount).toFixed(2));
    } else {
      // For exclusive, we add tax on top of netAmount
      let totalTax = 0;
      items.forEach((item) => {
        const itemSubtotal = item.price * item.quantity;
        const itemDiscount = (itemSubtotal * discountPercentage) / 100;
        const itemNet = itemSubtotal - itemDiscount;

        const taxRate = item.gstPercentage / 100;
        const itemTax = itemNet * taxRate;

        totalTax += itemTax;
      });
      gstAmount = Number(totalTax.toFixed(2));
      taxableAmount = Number(netAmount.toFixed(2));
    }

    const calculatedGrandTotal = taxableAmount + gstAmount;
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
