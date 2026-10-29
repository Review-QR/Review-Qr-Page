import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { generateBankBulkCsv } from "./bank-csv-generator.ts";
import { getCashfreePayoutsConfig } from "./cashfree-payouts-service.ts";

test("Cashfree Payouts configuration and graceful sandbox fallback", () => {
  const config = getCashfreePayoutsConfig();
  assert.ok(config.baseUrl.includes("payout"), "Payouts base URL must target Cashfree Payouts domain");
  assert.equal(typeof config.isConfigured, "boolean");
});

test("Indian Netbanking Bulk CSV generator produces valid corporate banking format", () => {
  const mockMerchants = [
    {
      businessId: "biz_deliciated_1",
      businessName: "Deliciated Cafe",
      ownerPhone: "9118643415",
      ordersCount: 4,
      orderIds: ["hord_1", "hord_2", "hord_3", "hord_4"],
      grossSales: 1200,
      platformCommission: 120,
      paymentGatewayFee: 21,
      netPayable: 1080,
      bankDetails: {
        id: "bank_1",
        business_id: "biz_deliciated_1",
        account_holder_name: "DELICIATED CAFE",
        bank_account_number: "50200098765432",
        ifsc_code: "HDFC0001234",
        bank_name: "HDFC Bank",
        account_type: "current",
        verification_status: "verified",
        verification_method: "penny_drop",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    },
  ];

  const mockRiders = [
    {
      id: "rpo_1",
      riderId: "rider_lucky_1",
      riderName: "Lucky Shukla",
      phone: "+919118643415",
      walletBalance: 280,
      cashInHand: 0,
      upiId: "luckyshukla@oksbi",
      amountRequested: 280,
      status: "pending",
    },
  ];

  const csv = generateBankBulkCsv({
    merchants: mockMerchants,
    riders: mockRiders,
  });

  assert.ok(csv.includes("Transaction_Type,Beneficiary_Account_Or_VPA,Beneficiary_IFSC,Beneficiary_Name,Amount_INR"), "CSV must contain standard headers");
  assert.ok(csv.includes("IMPS"), "Merchant row must specify IMPS");
  assert.ok(csv.includes("50200098765432"), "Merchant account number must be in CSV");
  assert.ok(csv.includes("HDFC0001234"), "Merchant IFSC must be in CSV");
  assert.ok(csv.includes("1080.00"), "Merchant net payable amount must be formatted to 2 decimals");
  assert.ok(csv.includes("UPI"), "Rider row must specify UPI");
  assert.ok(csv.includes("luckyshukla@oksbi"), "Rider UPI VPA must be in CSV");
  assert.ok(csv.includes("280.00"), "Rider withdrawal amount must be in CSV");
});

test("Settlements database migration defines rider_payout_requests and split batch links", () => {
  const migrationPath = path.resolve(process.cwd(), "supabase/migrations/20261029200000_payout_ledger_and_rider_settlements.sql");
  assert.ok(fs.existsSync(migrationPath), "Settlement migration file must exist");
  const sql = fs.readFileSync(migrationPath, "utf8");

  assert.match(sql, /create table if not exists public\.rider_payout_requests/);
  assert.match(sql, /destination_upi text/);
  assert.match(sql, /utr_number text/);
  assert.match(sql, /batch_id text/);
  assert.match(sql, /grant all on public\.rider_payout_requests to service_role/);
});

test("Admin settlements API route supports GET overview and POST actions", () => {
  const routePath = path.resolve(process.cwd(), "app/api/hyperlocal/admin/settlements/route.ts");
  assert.ok(fs.existsSync(routePath), "Settlement API route must exist");
  const code = fs.readFileSync(routePath, "utf8");

  assert.match(code, /export async function GET/);
  assert.match(code, /export async function POST/);
  assert.match(code, /action === "export_bank_csv"/);
  assert.match(code, /action === "settle_merchant_batch"/);
  assert.match(code, /action === "payout_merchant_cashfree"/);
  assert.match(code, /action === "settle_rider_payout"/);
  assert.match(code, /action === "payout_rider_cashfree"/);
});
