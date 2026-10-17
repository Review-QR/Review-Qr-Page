import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createCashfreeRequestInit } from "./cashfree-request-init.ts";

test("credentialed Cashfree requests disable redirects and never send credentials to the destination", async () => {
  const requestedUrls = [];
  const requestInit = createCashfreeRequestInit(
    { method: "POST", redirect: "follow" },
    { clientId: "fixture-id", clientSecret: "fixture-secret", apiVersion: "2026-01-01" }
  );
  const fetcher = async (url, init) => {
    requestedUrls.push(url);
    if (init.redirect !== "manual") {
      requestedUrls.push("https://untrusted.example/collect");
    }
    return new Response(null, {
      status: 302,
      headers: { location: "https://untrusted.example/collect" },
    });
  };
  const response = await fetcher("https://sandbox.cashfree.com/pg/orders", requestInit);

  assert.equal(requestInit.redirect, "manual");
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), "https://untrusted.example/collect");
  assert.deepEqual(requestedUrls, ["https://sandbox.cashfree.com/pg/orders"]);
});

test("all Cashfree API requests use the redirect-blocking authenticated client", async () => {
  const source = await readFile(new URL("./cashfree.ts", import.meta.url), "utf8");
  assert.match(source, /import \{ createCashfreeRequestInit \} from "@\/lib\/cashfree-request-init"/);
  assert.match(source, /createRequestInit\(init = \{\}\)\s*\{\s*return createCashfreeRequestInit\(init,/);
  assert.equal((source.match(/await fetch\(/g) ?? []).length, 4);
  assert.equal((source.match(/client\.createRequestInit\(/g) ?? []).length, 4);
});
