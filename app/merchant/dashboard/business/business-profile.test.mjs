import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { safeGoogleReviewLink } from "../../../../lib/safe-review-link.ts";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Google review link validation allows supported HTTPS domains only", () => {
  assert.equal(safeGoogleReviewLink("https://www.google.com/maps?cid=123"), "https://www.google.com/maps?cid=123");
  assert.equal(safeGoogleReviewLink("https://search.google.com/local/writereview?placeid=x"), "https://search.google.com/local/writereview?placeid=x");
  assert.equal(safeGoogleReviewLink("https://g.page/r/example"), "https://g.page/r/example");
  assert.equal(safeGoogleReviewLink("https://maps.app.goo.gl/example"), "https://maps.app.goo.gl/example");
  for (const value of [
    "javascript:alert(1)", "data:text/html,hello", "http://google.com/",
    "https://google.com.evil.test/", "https://evilgoogle.com/",
    "https://user@google.com/", "https://google.com:8443/", "not a URL",
  ]) assert.equal(safeGoogleReviewLink(value), null, value);
});

test("merchant link update is authenticated and uses only the session-bound update RPC", async () => {
  const action = await read("./actions.ts");
  const migration = await read("../../../../supabase/migrations/20261004100000_merchant_google_review_link.sql");
  assert.match(action, /getActiveMerchant\(\)/);
  assert.match(action, /safeGoogleReviewLink\(raw\)/);
  assert.match(action, /set_merchant_google_review_link/);
  assert.doesNotMatch(action, /p_business_id/);
  assert.match(migration, /account\.user_id = \(select auth\.uid\(\)\)/);
  assert.match(migration, /business\.merchant_status = 'active'/);
  assert.match(migration, /business\.deleted_at is null/);
  assert.match(migration, /grant execute on function public\.set_merchant_google_review_link\(text\)\s+to authenticated/i);
});
