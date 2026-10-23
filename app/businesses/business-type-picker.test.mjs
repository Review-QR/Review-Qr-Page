import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("registration and admin business forms use the shared database-backed category picker", async () => {
  const registration = await read("../register/business-form.tsx");
  const admin = await read("./page.tsx");
  const picker = await read("../components/searchable-business-type.tsx");
  const registrationPage = await read("../register/business/page.tsx");
  const categoryActions = await read("../business-categories/actions.ts");
  assert.match(registration, /<SearchableBusinessType/);
  assert.match(admin, /<SearchableBusinessType/g);
  assert.match(picker, /role="combobox"/);
  assert.match(picker, /role="listbox"/);
  assert.match(picker, /role="option"/);
  assert.match(picker, /event\.key === "ArrowDown"/);
  assert.match(picker, /event\.key === "ArrowUp"/);
  assert.match(picker, /event\.key === "Enter"/);
  assert.match(picker, /aria-activedescendant/);
  assert.match(picker, /type="hidden" name=\{name\} value=\{value\}/);
  assert.match(registrationPage, /getSelectableBusinessCategoryData/);
  assert.match(categoryActions, /getAdminSelectableBusinessCategoriesAction/);
  assert.doesNotMatch(registration, /<select[^>]*name="type"/);
});
