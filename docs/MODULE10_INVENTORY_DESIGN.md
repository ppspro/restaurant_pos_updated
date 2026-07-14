# Module 10: Inventory & Stock Management - Enterprise Design Document

## 1. Module Overview
The Inventory & Stock Management Module (Module 10) is a robust, production-ready system designed to handle the entire lifecycle of restaurant stock. It encompasses ingredient tracking, vendor relations, purchase order generation, goods receiving (GRN), waste logging, and low-stock alerting. It is built to integrate seamlessly with the existing Point of Sale architecture and paves the way for future automatic recipe-based deductions.

## 2. Business Objectives
- **End-to-end Visibility**: Track every gram, liter, and piece from vendor delivery to consumption or waste.
- **Cost Control**: Identify waste, manage vendor pricing, and accurately value current physical stock.
- **Operational Efficiency**: Automate low-stock alerts and streamline the Purchase Order process.
- **Future Proofing**: Establish a database schema that directly supports `Recipe` mapping to automatically deduct ingredient stock per POS sale in a future module.

## 3. Functional Requirements
- **Ingredient Management**: Full CRUD for raw materials, mapping them to Inventory Categories and specific Units of Measurement.
- **Vendor Management**: Track vendor profiles, contact details, and their historical purchase orders.
- **Purchase Orders & GRN**: Create POs, mark them pending, and selectively receive stock (full/partial) which inherently updates physical stock balances.
- **Stock Adjustments & Waste**: Manual mechanisms to correct stock levels (up or down) or log expired/damaged goods, mandating reasons and generating Audit Logs.
- **Alerts**: Highlight items hitting `reorderLevel` or `minimumStock` thresholds.
- **Reporting & Analytics**: Compute inventory valuation and visualize stock movement trends.

## 4. Non-Functional Requirements
- **Performance**: Stock updates must resolve under 300ms. Inventory loads < 500ms. Search < 100ms.
- **Scalability**: Capable of handling thousands of ingredients and dense daily stock movement logs without degrading table performance.
- **Reliability**: No negative stock allowed (unless specifically enabled for future edge cases).
- **Security**: Complete RBAC. Only `SUPER_ADMIN` or `MANAGER` roles can modify stock. All mutations must be logged to the global `AuditLog`.

## 5. User Stories
1. *As an Admin*, I need to add new ingredients so that we can track their stock levels.
2. *As a Manager*, I want to create a Purchase Order and email it to a Vendor.
3. *As a Kitchen Staff*, I want to log wasted ingredients at the end of the shift so inventory remains accurate.
4. *As an Admin*, I want to be alerted when items fall below their reorder level so I never run out of stock during a rush.

## 6. Inventory Workflow
1. **Setup**: Create Units -> Create Inventory Categories -> Create Vendors -> Create Ingredients.
2. **Purchasing**: Raise PO -> Vendor Delivers -> Perform Goods Receipt Note (GRN) -> Stock In.
3. **Daily Operations**: Staff logs manual adjustments, damages, or waste -> Stock Out.
4. *(Future) Sales*: Customer buys "Cheeseburger" -> POS maps to Recipe -> Deducts 1 Bun, 1 Patty, 10g Cheese -> Stock Out.

## 7. Business Rules
- **No Negative Stock**: Stock cannot fall below 0. Transactions attempting to do so must be rejected with `INV_003`.
- **Audit Everything**: Every explicit change to an ingredient's `currentStock` must generate a `StockMovement` ledger entry.
- **Soft Deletes**: Ingredients and Vendors are soft-deleted to preserve historical Purchase Orders and Reports.

## 8. Database Design (Prisma)
- `InventoryCategory`: Categorizes raw materials.
- `Ingredient`: Core item (SKU, barcode, unit, currentStock, minStock).
- `Vendor`: Supplier details.
- `PurchaseOrder`: Tracks PO status (PENDING, COMPLETED, CANCELLED).
- `PurchaseItem`: Items within a PO.
- `StockMovement`: Ledger for all IN/OUT/ADJUSTMENT events.
- `WasteLog`: Specific tracking for damaged or expired goods.
- `Recipe` & `RecipeIngredient`: *(Future Schema)* Maps Menu Items to Ingredients.

## 9. API Specification
- `GET /api/inventory/ingredients`
- `POST /api/inventory/ingredients`
- `GET /api/inventory/vendors`
- `POST /api/inventory/purchases`
- `POST /api/inventory/stock/adjust`
- `GET /api/inventory/alerts`

## 10. UI Wireframes & Components
- **InventoryLayout**: Central navigation wrapper with sub-routes for Ingredients, Vendors, Purchases, etc.
- **InventoryCards**: High-level KPI metrics (Total Value, Low Stock Count).
- **DataTable**: Standardized, paginated enterprise tables for all lists.
- **StockMovementTimeline**: Visual ledger of how an ingredient's stock fluctuated over time.

## 11. Security & Testing Strategy
- **Security**: Lock all routes behind `authenticate` and `authorize('SUPER_ADMIN', 'MANAGER')`.
- **Testing**: React Component testing for the Dashboard. Postman integration tests verifying that completing a Purchase Order successfully increments the associated Ingredient's stock balance.
