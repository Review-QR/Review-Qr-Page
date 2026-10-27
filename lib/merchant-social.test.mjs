import test from "node:test";
import assert from "node:assert/strict";
import { generateSocialCaption } from "./merchant-social.ts";

test("generateSocialCaption produces complete caption with city, shop, dish, and local hashtags", () => {
  const result = generateSocialCaption({
    dishName: "Special Kaju Katli",
    price: "880/kg",
    businessName: "Shukla Misthan Bhandar",
    city: "Bahraich",
    phone: "9876543210",
    tone: "foodie",
  });

  assert.match(result.headline, /Craving something delicious in Bahraich\?/);
  assert.match(result.body, /Special Kaju Katli/);
  assert.match(result.body, /₹880\/kg/);
  assert.match(result.body, /Shukla Misthan Bhandar/);
  assert.match(result.fullCaption, /📲 Order \/ Inquire on WhatsApp: \+91 9876543210/);
  assert.ok(result.hashtags.includes("#BahraichFoodies"));
  assert.ok(result.hashtags.includes("#ShuklaMisthanBhandar"));
  assert.ok(result.hashtags.includes("#SpecialKajuKatli"));
});

test("generateSocialCaption supports festive tone with greetings", () => {
  const result = generateSocialCaption({
    dishName: "Motichoor Ladoo",
    businessName: "Chhappan Bhog",
    city: "Bahraich",
    tone: "festive",
  });

  assert.match(result.headline, /Mithas aur Khushiyon ka Season/);
  assert.match(result.body, /Celebrate with our traditional Motichoor Ladoo/);
});
