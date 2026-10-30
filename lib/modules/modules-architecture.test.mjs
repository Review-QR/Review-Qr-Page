import assert from "node:assert/strict";
import test from "node:test";
import {
  assertCustomerOwnsOrder,
  assertCustomerOwnsAddress,
  CUSTOMER_PERMISSIONS,
} from "./customer/permissions.ts";
import {
  assertMerchantOwnsBusiness,
  MERCHANT_PERMISSIONS,
} from "./merchant/permissions.ts";
import {
  assertRiderAssignedToOrder,
  RIDER_PERMISSIONS,
} from "./rider/permissions.ts";
import {
  assertAdminAccess,
  ADMIN_PERMISSIONS,
} from "./admin/permissions.ts";
import { formatIndianCurrency } from "./shared/components/currency-format.ts";

test("Customer Module enforces strict multi-tenant order and address isolation", () => {
  // Matching customer passes
  assert.doesNotThrow(() => assertCustomerOwnsOrder("cust_123", "cust_123"));
  assert.doesNotThrow(() => assertCustomerOwnsAddress("cust_123", "cust_123"));

  // Cross-customer access throws unauthorized
  assert.throws(() => assertCustomerOwnsOrder("cust_123", "cust_456"), /Unauthorized/);
  assert.throws(() => assertCustomerOwnsOrder("cust_123", null), /Unauthorized/);
  assert.throws(() => assertCustomerOwnsAddress("cust_123", "cust_999"), /Unauthorized/);

  assert.ok(CUSTOMER_PERMISSIONS.VIEW_OWN_ORDERS);
  assert.ok(CUSTOMER_PERMISSIONS.PLACE_ORDER);
});

test("Merchant Module enforces strict business-level isolation", () => {
  // Matching business ID passes
  assert.doesNotThrow(() => assertMerchantOwnsBusiness("biz_alpha", "biz_alpha"));

  // Cross-merchant access throws unauthorized
  assert.throws(() => assertMerchantOwnsBusiness("biz_alpha", "biz_beta"), /Unauthorized/);
  assert.throws(() => assertMerchantOwnsBusiness("biz_alpha", ""), /Unauthorized/);

  assert.ok(MERCHANT_PERMISSIONS.VIEW_STORE_DASHBOARD);
  assert.ok(MERCHANT_PERMISSIONS.MANAGE_CATALOG);
});

test("Rider Module enforces assigned-order delivery permissions", () => {
  // Assigned rider passes
  assert.doesNotThrow(() => assertRiderAssignedToOrder("rider_007", "rider_007"));

  // Unassigned rider throws unauthorized
  assert.throws(() => assertRiderAssignedToOrder("rider_007", "rider_999"), /Unauthorized/);
  assert.throws(() => assertRiderAssignedToOrder("rider_007", null), /Unauthorized/);

  assert.ok(RIDER_PERMISSIONS.TOGGLE_DUTY_STATUS);
  assert.ok(RIDER_PERMISSIONS.VERIFY_DOORSTEP_OTP);
});

test("Admin Module restricts platform management to verified administrators", () => {
  // Admin passes
  assert.doesNotThrow(() => assertAdminAccess(true));

  // Non-admin throws forbidden
  assert.throws(() => assertAdminAccess(false), /Forbidden/);

  assert.ok(ADMIN_PERMISSIONS.VIEW_COMMAND_CENTER);
  assert.ok(ADMIN_PERMISSIONS.CANCEL_DOORSTEP_REFUSAL);
});

test("Shared Components format Indian currency correctly without paisa when whole", () => {
  const formattedWhole = formatIndianCurrency(24580);
  assert.ok(formattedWhole.includes("24,580"), `Expected formatted string to contain 24,580, got ${formattedWhole}`);

  const formattedFloat = formatIndianCurrency(180.5);
  assert.ok(formattedFloat.includes("180.5"), `Expected formatted string to contain 180.5, got ${formattedFloat}`);
});
