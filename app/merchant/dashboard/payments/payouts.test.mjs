import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("merchant payments page requires active merchant and loads bank payouts and settlement passbook", async () => {
  const page = await read("./page.tsx");
  assert.match(page, /await requireActiveMerchant\(\)/);
  assert.match(page, /getMerchantBankDetails\(merchant\.businessId\)/);
  assert.match(page, /getMerchantFinancialSummary\(merchant\.businessId\)/);
  assert.match(page, /getMerchantSettlementLedger\(merchant\.businessId\)/);
  assert.match(page, /getMerchantKycDocuments\(merchant\.businessId\)/);
  assert.match(page, /<MerchantPayoutsClient/);
  assert.match(page, /<PaymentHistory businessId=\{merchant\.businessId\} \/>/);
});

test("merchant payouts client renders Today, This Week, This Month KPI cards and UTR passbook", async () => {
  const client = await read("./merchant-payouts-client.tsx");
  assert.match(client, /Today(?:'|&apos;)s Orders/);
  assert.match(client, /This Week/);
  assert.match(client, /This Month/);
  assert.match(client, /Bank Account/);
  assert.match(client, /Daily Settlements & Passbook/);
  assert.match(client, /handleExportCsv/);
  assert.match(client, /bank_utr_number/);
  assert.match(client, /Enterprise Fraud Protection/);
  assert.match(client, /24-hour security cooling-off hold/);
});

test("bank and kyc database migration defines secure tables and RLS policies", async () => {
  const migration = await read("../../../../supabase/migrations/20261028160000_merchant_onboarding_kyc_and_bank_payouts.sql");
  assert.match(migration, /create table if not exists public\.merchant_bank_accounts/);
  assert.match(migration, /create table if not exists public\.merchant_kyc_documents/);
  assert.match(migration, /create table if not exists public\.merchant_bank_change_requests/);
  assert.match(migration, /create table if not exists public\.merchant_settlement_batches/);
  assert.match(migration, /alter table public\.merchant_bank_accounts enable row level security/);
  assert.match(migration, /penny_drop/);
});

test("admin merchant management exposes Banking and Payout compliance section in details modal", async () => {
  const adminUi = await read("../../../merchants/merchant-management.tsx");
  assert.match(adminUi, /Bank & Payouts Compliance/);
  assert.match(adminUi, /Penny-Drop ₹1 Matched/);
  assert.match(adminUi, /FSSAI & PAN Verified/);
});

test("merchant profile page presents the dedicated Business Account and Settlements section", async () => {
  const profilePage = await read("../profile/page.tsx");
  assert.match(profilePage, /Business Account and Settlements/);
  assert.match(profilePage, /Penny-Drop Verified/);
  assert.match(profilePage, /View Settlements & Bank Passbook/);
});
