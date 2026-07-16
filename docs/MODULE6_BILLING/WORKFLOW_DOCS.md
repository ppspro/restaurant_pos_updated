# Billing Workflow Documentation

This document visually describes the lifecycle of an order from selection to payment to KOT printing.

## 1. Sequence Diagram: Checkout Flow

```mermaid
sequenceDiagram
    participant C as Cashier (UI)
    participant S as Billing Store (Zustand)
    participant A as Billing API
    participant DB as Postgres
    
    C->>S: Add Items to Cart
    C->>S: Select Payment Method (Cash)
    C->>A: POST /api/billing/orders (Payload)
    
    A->>DB: Check if BusinessDay status = 'OPEN'
    alt Business Day Closed
        DB-->>A: Null
        A-->>C: 409 Conflict (No Active Day)
    else Business Day Open
        DB-->>A: Active Business Day ID
        
        A->>DB: BEGIN TRANSACTION
        A->>DB: Atomic Increment TokenCounter
        A->>DB: Insert Order & OrderItems
        A->>DB: Insert Payment Record
        A->>DB: Insert AuditLog
        A->>DB: COMMIT TRANSACTION
        
        DB-->>A: Returns Order UUID & Token
        A-->>C: 201 Created (Token + Order Data)
        
        C->>S: Generate Receipt HTML locally
        C->>C: Open ReceiptPreview Modal
        C->>S: Save to CompletedOrders
    end
```

## 2. State Diagram: UI Flow

```mermaid
stateDiagram-v2
    [*] --> Idle : Launch Billing
    
    Idle --> CartActive : Add Item
    CartActive --> CartActive : Update Qty / Add Note
    CartActive --> DiscountDialog : Apply Discount
    DiscountDialog --> CartActive : Confirm
    
    CartActive --> PaymentDialog : Click Pay (CASH/UPI/CARD)
    PaymentDialog --> API_Pending : Confirm Payment Details
    
    API_Pending --> Success_View : 201 Created
    API_Pending --> Error_View : 4xx/5xx Failed
    
    Error_View --> PaymentDialog : Retry
    Success_View --> Idle : Click Next Customer (Clears Cart)
```

## 3. Business Rules around KOTs
A critical requirement of this POS system is Zero-Waste Kitchen Routing. The workflow applies these rules automatically in the frontend when constructing the `ReceiptBundle`:
- **If Cart has NO Kitchen Items:** The `kot` field in the receipt bundle is strictly `null`. Only Customer and Restaurant receipts are shown.
- **If Cart has Mixed Items:** The `kot` template maps over the array and strictly filters out `itemType === 'PACKED'`. The cooks will not see Coca Cola on their slip.
