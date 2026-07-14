# Module 12: Customer & Loyalty Management - Enterprise Design Document

## 1. Module Overview
The Customer & Loyalty Management module acts as a robust CRM natively integrated into the POS. It provides mechanisms for identifying walk-in versus registered customers during billing, securely managing their PII (Personally Identifiable Information), and incentivizing retention through a dynamic Loyalty Points engine.

## 2. Business Objectives
- **Frictionless Billing**: Ensure customer capture does not slow down the checkout queue. "Walk-in" remains the default.
- **Customer Retention**: Deploy a loyalty system that rewards repeat visits, increasing Lifetime Value (LTV).
- **Data Insights**: Empower administrators with analytics detailing average spend, visit frequency, and customer demographics.

## 3. Functional Requirements
- **Customer Management**: Full CRUD for profiles. Must track unique Mobile Numbers, Email, DOB, Anniversary, and GST (for B2B).
- **Billing Integration**: Quick-add customer modal inside the POS Billing screen. Seamlessly attach an existing customer to an active order.
- **Loyalty Engine**: 
  - Earn: Automatically calculate points earned post-payment based on subtotal.
  - Redeem: Allow points to act as a currency discount during checkout.
  - History: Strict ledger (`LoyaltyTransaction`) logging every point earned, redeemed, or expired.
- **Analytics & History**: Dedicated dashboard to view a customer's favorite items, total lifetime spend, and visit frequency.
- **Reward Tiers**: Classify customers (Bronze, Silver, Gold, Platinum) based on lifetime points or revenue.

## 4. Non-Functional Requirements
- **Performance**: Customer search (by mobile number) must be highly indexed and return in < 100ms to prevent POS blocking.
- **Security**: Cashiers can search and create customers, but only Managers/Admins can export the database or view aggregate analytics.
- **Resilience**: Point calculations must be strictly transactional. Cancelled orders must automatically claw back earned points.

## 5. User Stories
1. *As a Cashier*, I want to quickly punch in a customer's phone number during billing to load their profile or create a new one in under 5 seconds.
2. *As a Customer*, I want to redeem my accumulated 500 points to get a ₹50 discount on my current order.
3. *As a Restaurant Owner*, I want to see a list of customers whose birthday is this week so I can send them promotional offers.

## 6. Business Rules
- **Optionality**: An `Order` can exist without a `CustomerId` (walk-in).
- **Uniqueness**: Mobile numbers are the primary unique identifier for customers.
- **Earn Rules**: Points are *only* credited when an Order transitions to `PAID`.
- **Clawback**: If an Order is `CANCELLED`, any points earned from that specific order must be negated via a strict audit ledger.

## 7. Database Design (Prisma)
- **`Customer`**: Core profile data, total earned points, current point balance, reward tier.
- **`LoyaltyTransaction`**: Immutable ledger (Customer ID, Points, Type: EARN/REDEEM/EXPIRED, Order ID reference).
- **`Order` (Modification)**: Add optional `customerId` relation.

## 8. API Specification
- `GET /api/customers` (paginated, searchable)
- `POST /api/customers` (quick create)
- `GET /api/customers/:id/history` (orders & favorite items)
- `POST /api/loyalty/redeem` (transactional point deduction)
- `GET /api/customers/analytics` (LTV, segments)

## 9. UI Wireframes & Architecture
- **CustomerDashboard**: High-level KPIs (Total Customers, Total Points Outstanding) and a paginated data table.
- **CustomerProfileDrawer**: Slide-out panel showing contact info, point balance, and an infinite-scroll list of their past orders.
- **POS Integration Modal**: A fast, keyboard-friendly search box in the POS screen to attach a customer.

## 10. Security & Testing Strategy
- **Security**: Cashier roles are restricted to `GET` and `POST` (creation). Only `SUPER_ADMIN` can invoke bulk exports or deep analytics.
- **Testing**: React Component testing for the Dashboard. Postman integration tests verifying that completing an order successfully increments the `Customer` point balance and logs a `LoyaltyTransaction`.
