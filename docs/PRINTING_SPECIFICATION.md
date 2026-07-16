# Printing Specification

## 1. Print Modes
- **ESC/POS Commands**: Direct low-level binary commands to TCP/IP and USB receipt printers.
- **Browser HTML Printing**: System print driver utilizing modern `@media print` CSS rules.

## 2. Page & Paper Dimensions
- **58mm Layouts**: 32 characters per line max, default margin 2mm.
- **80mm Layouts**: 48 characters per line max, default margin 3mm.
- **A4 Sheets**: Structured invoice layout.

## 3. Receipt Layout Specifications
### Customer Copy & Restaurant Copy
- Header (Restaurant Title, Address, GSTIN).
- Metadata (Token Number, Date, Time, Cashier Name).
- Line Items (Name, Qty, Rate, Total).
- Footer (GST summary, Payment Mode, Thank You message).

### Kitchen Order Ticket (KOT)
- Metadata (Token Number, Date, Time, Special instructions).
- Line Items (Kitchen items and quantities only, NO prices, NO totals).
