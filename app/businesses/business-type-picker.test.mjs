import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("registration and admin business forms use the shared searchable canonical picker", async () => {
  const registration = await read("../register/business-form.tsx");
  const admin = await read("./page.tsx");
  const picker = await read("./business-type-picker.tsx");
  assert.match(registration, /<BusinessTypePicker/);
  assert.match(admin, /<BusinessTypePicker/g);
  assert.match(picker, /role="combobox"/);
  assert.match(picker, /role="listbox"/);
  assert.match(picker, /role="option"/);
  assert.match(picker, /event\.key === "ArrowDown"/);
  assert.match(picker, /event\.key === "ArrowUp"/);
  assert.match(picker, /event\.key === "Enter"/);
  assert.match(picker, /aria-activedescendant/);
  assert.match(picker, /name="type" value=\{value\}/);
  assert.doesNotMatch(registration, /<select[^>]*name="type"/);
});
