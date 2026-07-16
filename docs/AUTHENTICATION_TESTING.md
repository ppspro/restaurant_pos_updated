# Authentication & Authorization Testing Plan

This document outlines the testing strategy, test cases, and checklists to validate Module 2 (Authentication & Authorization) of the Restaurant POS System.

---

## 1. Backend Testing Suite

### 1.1 JWT Verification Scenarios
| Test Case ID | Scenario | Input | Expected Output | HTTP Status |
|---|---|---|---|---|
| JWT-001 | Valid Access Token | Header `Authorization: Bearer <valid_token>` | Return requested resource payload | 200 OK |
| JWT-002 | Missing Auth Token | Header `Authorization` omitted | Return error "No authentication token provided" | 401 Unauthorized |
| JWT-003 | Invalid Token Signature | Header `Authorization: Bearer fake_signature` | Return error "Invalid or expired authentication token" | 401 Unauthorized |
| JWT-004 | Expired Access Token | Header `Authorization: Bearer <expired_token>` | Return error "Invalid or expired authentication token" | 401 Unauthorized |
| JWT-005 | Malformed Auth Format | Header `Authorization: Basic encoded_string` | Return error "No authentication token provided" | 401 Unauthorized |

### 1.2 Role & Permission Gating Scenarios
| Test Case ID | Scenario | User Role | Required Permission | Expected Output | HTTP Status |
|---|---|---|---|---|---|
| AUTH-001 | Super Admin access | SUPER_ADMIN | `MANAGE_SETTINGS` | Access permitted | 200 OK |
| AUTH-002 | Cashier access denied | CASHIER | `MANAGE_SETTINGS` | Return error "Access denied: missing permission..." | 403 Forbidden |
| AUTH-003 | Cashier access allowed | CASHIER | `PROCESS_BILLING` | Access permitted | 200 OK |

### 1.3 Refresh Token Strategy & Reuse Detection
| Test Case ID | Scenario | Input | Expected Output | HTTP Status |
|---|---|---|---|---|
| ROT-001 | Valid Refresh Token | POST `/refresh` with `{ refreshToken }` | Rotate: return new access and refresh tokens | 200 OK |
| ROT-002 | Revoked/Rotated Token Reuse | POST `/refresh` with old/used token | Reuse Detection: Revoke all user tokens, return alert | 401 Unauthorized |
| ROT-003 | Expired Refresh Token | POST `/refresh` with expired token | Return error "Refresh token expired" | 401 Unauthorized |
| ROT-004 | Logout Specific Session | POST `/logout` with `{ refreshToken }` | Set specific token `isRevoked = true` | 200 OK |
| ROT-005 | Logout All Sessions | POST `/logout-all` (authenticated) | Set all user tokens `isRevoked = true` | 200 OK |

### 1.4 Change Password Scenarios
| Test Case ID | Scenario | Input | Expected Output | HTTP Status |
|---|---|---|---|---|
| PWD-001 | Successful password change | Valid old password, strong new password | Change password, revoke all tokens | 200 OK |
| PWD-002 | Password validation - Short | Length: 6 characters | Return error "New password must be at least 8 chars" | 400 Bad Request |
| PWD-003 | Password validation - Complexity | Missing special character | Return error "New password must contain special char" | 400 Bad Request |
| PWD-004 | Incorrect Old Password | Invalid old password | Return error "Invalid old password" | 400 Bad Request |

---

## 2. Frontend Testing Suite

### 2.1 Route Protection & Redirections
- **Scenario**: Navigate directly to `/dashboard` without signing in.
  - *Expected*: Immediately redirect to `/login` and save history path.
- **Scenario**: Sign in as a `CASHIER` and attempt to load `/dashboard`.
  - *Expected*: Redirect to `/unauthorized` (403 Forbidden screen).
- **Scenario**: Load `/login` when already authenticated.
  - *Expected*: Detect role and redirect to `/dashboard` (admin) or `/billing` (cashier).

### 2.2 Form validations (LoginForm)
- **Scenario**: Submit empty form.
  - *Expected*: Highlight input borders in red, display inline warning labels: "Username is required", "Password is required".
- **Scenario**: Submit short password.
  - *Expected*: Display inline warning: "Password must be at least 6 characters".
- **Scenario**: Toggle password visibility.
  - *Expected*: Click eye icon, change input type from `password` to `text` and vice versa.

### 2.3 Session Persistence
- **Scenario**: Sign in, refresh page.
  - *Expected*: Session preserved via Zustand `pos-auth-storage` localStorage variable. State remains active.
- **Scenario**: Corrupt `pos-auth-storage` tokens in localStorage, refresh page.
  - *Expected*: Interceptor catches 401, triggers auto-logout, clears store state, redirects to `/login`.

---

## 3. Manual Testing Checklist

- [ ] Verify database seeding has generated `admin` and `cashier` profiles.
- [ ] Log in as `admin`, verify redirect to `/dashboard` layout page.
- [ ] Log in as `cashier`, verify redirect to `/billing` checkout page.
- [ ] Verify that audit logs are generated in `audit_logs` database table on login success, login failure, logout, and password change events.
- [ ] Test password change and verify that other tabs/devices are signed out.
- [ ] Test token reuse: capture a rotated refresh token, resubmit it to `/api/v1/auth/refresh`, and verify that all user sessions are immediately revoked.
