import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Add Business registers its submit handler through React's form action path", async () => {
  const page = await read("./page.tsx");
  const picker = await read("../components/searchable-business-type.tsx");
  const form = page.match(/<form action=\{handleSubmit\}[\s\S]*?<\/form>/)?.[0];
  assert.ok(form, "Add Business form should register the React action callback");
  assert.doesNotMatch(form, /onSubmit=\{handleSubmit\}/);
  assert.match(page, /async function handleSubmit\(formData: FormData\)/);
  assert.match(page, /formData\.get\("name"\)/);
  assert.match(page, /formData\.get\("review_link"\)/);
  assert.match(page, /await createAdminBusiness\(\{/);

  for (const name of ["name", "owner", "phone", "plan", "expiry", "review_link", "address"]) {
    assert.match(form, new RegExp(`name="${name}"`), `${name} is included in submitted FormData`);
  }
  assert.match(form, /<SearchableBusinessType\s+id="add-business-type"/);
  assert.match(picker, /name = "type"/);
  assert.match(picker, /<input type="hidden" name=\{name\} value=\{value\} \/>/);
  assert.match(page, /if \(!name\)[\s\S]*?Business name required/);
  assert.match(page, /if \(!reviewLink\)[\s\S]*?Google Review link required/);
  assert.match(page, /setSaving\(true\)/);
  assert.match(page, /finally \{\s*setSaving\(false\)/);
  assert.match(page, /await loadBusinesses\(\)/);

  assert.equal((form.match(/<form\b/g) ?? []).length, 1, "Add Business must not contain a nested form");
  assert.equal((form.match(/type="submit"/g) ?? []).length, 1);
});

test("Add Business continues to use the authenticated and server-validated creation action", async () => {
  const page = await read("./page.tsx");
  const action = await read("./actions.ts");
  assert.match(page, /await createAdminBusiness\(\{[\s\S]*?review_link: reviewLink/);
  assert.match(action, /await requireActiveAdmin\(\)/);
  assert.match(action, /const business = parseBusiness\(input\)/);
  assert.match(action, /isAvailableBusinessType\(business\.type \?\? ""\)/);
  assert.match(action, /merchant_status: "pending"/);
  assert.match(action, /\.from\("businesses"\)\s*\.insert\(/);
});

test("Searchable business type keeps suggestion buttons out of form submission", async () => {
  const picker = await read("../components/searchable-business-type.tsx");
  assert.match(picker, /type="button"[\s\S]*?role="option"/);
  assert.match(picker, /id=\{inputId\}/);
});
