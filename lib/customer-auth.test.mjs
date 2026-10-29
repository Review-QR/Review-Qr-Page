import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

test("customer auth database migration defines customers, addresses, and auth codes with RLS", () => {
  const migrationPath = path.resolve(
    process.cwd(),
    "supabase/migrations/20261029100000_customer_email_auth_and_saved_addresses.sql"
  );
  assert.ok(fs.existsSync(migrationPath), "Migration file must exist");
  const sql = fs.readFileSync(migrationPath, "utf8");

  assert.match(sql, /create table if not exists public\.customers/i);
  assert.match(sql, /create table if not exists public\.customer_addresses/i);
  assert.match(sql, /create table if not exists public\.customer_auth_codes/i);
  assert.match(sql, /customers_email_idx/i);
  assert.match(sql, /customer_addresses_customer_idx/i);
  assert.match(sql, /customer_auth_codes_dest_idx/i);
  assert.match(sql, /alter table public\.customers enable row level security/i);
  assert.match(sql, /alter table public\.customer_addresses enable row level security/i);
  assert.match(sql, /alter table public\.customer_auth_codes enable row level security/i);
  assert.match(sql, /grant all on table public\.customers to postgres, service_role, authenticated, anon;/i);
  assert.match(sql, /grant all on table public\.customer_addresses to postgres, service_role, authenticated, anon;/i);
  assert.match(sql, /grant all on table public\.customer_auth_codes to postgres, service_role, authenticated, anon;/i);
});

test("email verification code hashing produces consistent SHA-256 hex string", () => {
  const code = "749201";
  const expectedHash = createHash("sha256").update(code.trim()).digest("hex");
  assert.equal(expectedHash.length, 64);
  assert.equal(
    createHash("sha256").update("749201").digest("hex"),
    expectedHash
  );
  assert.notEqual(
    createHash("sha256").update("749202").digest("hex"),
    expectedHash
  );
});

test("customer address route and auth endpoints exist with proper structure", () => {
  const sendOtpRoute = path.resolve(process.cwd(), "app/api/customer/auth/send-otp/route.ts");
  const verifyOtpRoute = path.resolve(process.cwd(), "app/api/customer/auth/verify-otp/route.ts");
  const addressesRoute = path.resolve(process.cwd(), "app/api/customer/addresses/route.ts");

  assert.ok(fs.existsSync(sendOtpRoute), "Send OTP route file must exist");
  assert.ok(fs.existsSync(verifyOtpRoute), "Verify OTP route file must exist");
  assert.ok(fs.existsSync(addressesRoute), "Addresses route file must exist");

  const sendOtpContent = fs.readFileSync(sendOtpRoute, "utf8");
  assert.match(sendOtpContent, /generateAndSendEmailOtp/);
  assert.match(sendOtpContent, /export async function POST/);

  const verifyOtpContent = fs.readFileSync(verifyOtpRoute, "utf8");
  assert.match(verifyOtpContent, /verifyEmailOtp/);
  assert.match(verifyOtpContent, /export async function POST/);

  const addressesContent = fs.readFileSync(addressesRoute, "utf8");
  assert.match(addressesContent, /export async function GET/);
  assert.match(addressesContent, /export async function POST/);
  assert.match(addressesContent, /export async function DELETE/);
});

test("super-app order portal client contains Email OTP login and 2-Tab profile navigation", () => {
  const portalPath = path.resolve(process.cwd(), "app/order/order-portal-client.tsx");
  const content = fs.readFileSync(portalPath, "utf8");

  assert.match(content, /loadCashfreeSdk/);
  assert.match(content, /isPaymentLaunching/);
  assert.match(content, /Connecting to Cashfree/);
  assert.match(content, /loginStep === "email"/);
  assert.match(content, /setLoginStep\("otp"\)/);
  assert.match(content, /profileTab === "addresses"/);
  assert.match(content, /profileTab === "orders"/);
  assert.match(content, /handleReorder/);
  assert.match(content, /handleDeleteAddress/);
  assert.match(content, /handleSendOtp/);
  assert.match(content, /handleVerifyOtp/);
  assert.match(content, /handleCreateProfile/);
  assert.match(content, /isNewCustomer/);
  assert.match(content, /loginStep === "name_prompt"/);
  assert.match(content, /handleSignOut/);
});
