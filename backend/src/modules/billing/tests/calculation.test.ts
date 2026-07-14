import { CalculationService, InputCartItem } from '../services/calculation.service';
import * as assert from 'assert';

function runTests() {
  console.log('Starting Billing Calculation Engine Unit Tests...');

  const sampleCart: InputCartItem[] = [
    { id: '1', name: 'Masala Dosa', price: 100, quantity: 2, gstPercentage: 5, itemType: 'KITCHEN' }, // 200 INR
    { id: '2', name: 'Water Bottle', price: 20, quantity: 1, gstPercentage: 18, itemType: 'PACKED' }, // 20 INR
  ];

  // Test 1: Tax Inclusive Calculation, No Discount
  try {
    const result = CalculationService.calculateBill(sampleCart, 0, true);
    console.log('Result Inclusive:', result);
    
    assert.strictEqual(result.subtotal, 220);
    assert.strictEqual(result.discountAmount, 0);
    // Masala Dosa tax = 200 - (200 / 1.05) = 9.52
    // Water Bottle tax = 20 - (20 / 1.18) = 3.05
    // total tax = 12.57
    assert.strictEqual(result.gstAmount, 12.57);
    assert.strictEqual(result.taxableAmount, 207.43);
    assert.strictEqual(result.grandTotal, 220);
    assert.strictEqual(result.kitchenItemsCount, 2);
    assert.strictEqual(result.packedItemsCount, 1);
    console.log('✓ Test 1: Tax Inclusive Passed');
  } catch (error) {
    console.error('✗ Test 1: Tax Inclusive Failed', error);
    process.exit(1);
  }

  // Test 2: Tax Exclusive Calculation, 10% Discount
  try {
    const result = CalculationService.calculateBill(sampleCart, 10, false);
    console.log('Result Exclusive:', result);
    
    assert.strictEqual(result.subtotal, 220);
    assert.strictEqual(result.discountAmount, 22); // 10% of 220
    // Net Masala Dosa = 180. Tax = 180 * 0.05 = 9
    // Net Water Bottle = 18. Tax = 18 * 0.18 = 3.24
    // total tax = 12.24
    assert.strictEqual(result.gstAmount, 12.24);
    assert.strictEqual(result.taxableAmount, 198); // 220 - 22
    // grandTotal = 198 + 12.24 = 210.24 -> Rounded to 210
    assert.strictEqual(result.grandTotal, 210);
    assert.strictEqual(result.roundOff, -0.24);
    console.log('✓ Test 2: Tax Exclusive Passed');
  } catch (error) {
    console.error('✗ Test 2: Tax Exclusive Failed', error);
    process.exit(1);
  }

  // Test 3: Negative Price Validation
  try {
    const badCart: InputCartItem[] = [
      { id: '1', name: 'Neg Item', price: -50, quantity: 1, gstPercentage: 5, itemType: 'KITCHEN' }
    ];
    assert.throws(() => {
      CalculationService.calculateBill(badCart, 0, true);
    }, /Item price cannot be negative/);
    console.log('✓ Test 3: Negative Price Check Passed');
  } catch (error) {
    console.error('✗ Test 3: Negative Price Check Failed', error);
    process.exit(1);
  }

  console.log('All tests completed successfully!');
}

runTests();
