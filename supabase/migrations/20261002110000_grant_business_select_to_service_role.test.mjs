import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("production admin business grant is read-only and scoped to businesses", async () => {
  const migration = await readFile(new URL("./20261002110000_grant_business_select_to_service_role.sql", import.meta.url), "utf8");
  assert.match(migration, /grant\s+select\s+on\s+table\s+public\.businesses\s+to\s+service_role\s*;/i);
  assert.doesNotMatch(migration, /\b(revoke|drop|truncate|delete|update|insert|disable\s+row\s+level\s+security)\b/i);
});
