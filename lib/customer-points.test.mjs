import test from "node:test";
import assert from "node:assert/strict";
import {
  INR_PER_POINTS_UNIT,
  POINTS_UNIT,
  calculatePointsInrValue,
  formatPointsInr,
} from "./customer-points.ts";

test("customer reward points follow 350 points = INR 100 ratio", () => {
  assert.equal(POINTS_UNIT, 350);
  assert.equal(INR_PER_POINTS_UNIT, 100);

  assert.equal(calculatePointsInrValue(0), 0);
  assert.equal(calculatePointsInrValue(-50), 0);
  assert.equal(calculatePointsInrValue(null), 0);
  assert.equal(calculatePointsInrValue(undefined), 0);
  assert.equal(calculatePointsInrValue(Number.NaN), 0);

  assert.equal(calculatePointsInrValue(350), 100);
  assert.equal(calculatePointsInrValue(700), 200);
  assert.equal(calculatePointsInrValue(175), 50);
  assert.equal(calculatePointsInrValue(100), 28.57);

  assert.equal(formatPointsInr(0), "₹0");
  assert.equal(formatPointsInr(350), "₹100");
  assert.equal(formatPointsInr(100), "₹28.57");
});
