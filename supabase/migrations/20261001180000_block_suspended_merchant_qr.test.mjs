import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migration = await readFile(
  new URL("./20261001180000_block_suspended_merchant_qr.sql", import.meta.url),
  "utf8",
);

test("public QR lookup and scan counting reject suspended merchants", () => {
  const definitions = migration.split("create or replace function public.");
  const lookup = definitions.find((definition) => definition.startsWith("get_business_for_qr"));
  const scan = definitions.find((definition) => definition.startsWith("increment_business_scan"));

  assert.ok(lookup);
  assert.ok(scan);
  assert.match(lookup, /business\.merchant_status is distinct from 'suspended'/i);
  assert.match(scan, /business\.merchant_status is distinct from 'suspended'/i);
  assert.match(lookup, /set search_path = ''/i);
  assert.match(scan, /set search_path = ''/i);
  assert.match(migration, /grant execute on function public\.get_business_for_qr\(text\) to anon/i);
  assert.match(migration, /grant execute on function public\.increment_business_scan\(text\) to anon/i);
  assert.match(migration, /from public, authenticated, service_role/i);
});
