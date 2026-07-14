# Business Rules Manual

## 1. Prepaid Order Flow
- **Rule 1.1**: The system supports ONLY prepaid transactions.
- **Rule 1.2**: Orders are maintained in DRAFT state during cart generation and checkout.
- **Rule 1.3**: The order is confirmed and state is set to PAID only after receiving payment verification webhook or cashier validation.

## 2. Token Numbers
- **Rule 2.1**: A successful payment yields exactly one unique Token.
- **Rule 2.2**: Tokens reset daily to `001` at midnight local time.
- **Rule 2.3**: Reprinting a receipt must NEVER generate a new Token.

## 3. KOT Printing
- **Rule 3.1**: KOTs contain only `Kitchen` items.
- **Rule 3.2**: `Packed` items are strictly excluded.
- **Rule 3.3**: If an order contains only `Packed` items, no KOT print job is queued.

## 4. Cancellations
- **Rule 4.1**: Order cancellation is restricted to `Super Admin` users.
- **Rule 4.2**: Cancelled orders remain in the database for auditing purposes.
