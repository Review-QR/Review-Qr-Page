import fs from "fs";
import path from "path";

function loadEnvKey() {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(/FAST2SMS_API_KEY\s*=\s*(.+)/);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  } catch {
    // fallback
  }
  return "Mf7YoD2o2xxlaPj6wFCEDwdRQIQ8dsKA8femX5AiIKzutPxXXz0Wr124VZwqVochkdwuj2ltzJJYx9L5";
}

const key = loadEnvKey();

async function checkFast2SmsStatus() {
  console.log("=================================================");
  console.log("       TRUSTIT FAST2SMS & WHATSAPP DIAGNOSTIC     ");
  console.log("=================================================\n");

  // 1. Check Wallet Balance
  try {
    const res = await fetch("https://www.fast2sms.com/dev/wallet", {
      headers: { authorization: key },
    });
    const wallet = await res.json();
    console.log("💰 [WALLET STATUS]");
    console.log(`   Balance: ₹${wallet.wallet || "0.00"}`);
    console.log(`   SMS Count Remaining: ${wallet.sms_count || 0}`);
  } catch (err) {
    console.error("❌ Wallet check error:", err.message);
  }

  console.log("\n-------------------------------------------------");

  // 2. Check WhatsApp WABA & Numbers
  try {
    const res = await fetch("https://www.fast2sms.com/dev/dlt_manager/whatsapp?type=template", {
      headers: { authorization: key },
    });
    const data = await res.json();
    console.log("📱 [WHATSAPP WABA & NUMBER DETAILS]");

    if (!data?.success || !Array.isArray(data?.data) || data.data.length === 0) {
      console.log("   No WhatsApp Business Accounts (WABA) connected yet on this Fast2SMS account.");
      console.log("   👉 Connect via Fast2SMS Dashboard > WhatsApp > Add Number.");
      return;
    }

    for (const [idx, waba] of data.data.entries()) {
      console.log(`\n   [WABA #${idx + 1}]`);
      console.log(`   • WABA ID:          ${waba.waba_id}`);
      console.log(`   • Phone Number ID:  ${waba.phone_number_id}`);
      console.log(`   • Number:           ${waba.number}`);
      console.log(`   • Verified Name:    ${waba.verified_name}`);
      console.log(`   • Connection:       ${waba.connection_status}`);
      console.log(`   • Quality Rating:   ${waba.quality_rating}`);
      console.log(`   • Messaging Limit:  ${waba.messaging_limit}`);

      const templates = waba.templates || [];
      console.log(`\n   📄 Templates (${templates.length}):`);
      if (templates.length === 0) {
        console.log("      No templates found for this number.");
      } else {
        for (const t of templates) {
          console.log(`      ---------------------------------------`);
          console.log(`      • Template Name: ${t.template_name}`);
          console.log(`      • Message ID:    ${t.message_id}`);
          console.log(`      • Status:        ${t.status === "Approved" ? "✅ APPROVED" : t.status === "Pending" ? "⏳ PENDING" : "❌ " + t.status}`);
          console.log(`      • Category:      ${t.category}`);
          console.log(`      • Language:      ${t.language}`);
          if (t.components) {
            for (const comp of t.components) {
              if (comp.type === "BODY") {
                console.log(`      • Body Text:     ${comp.text.replace(/\r?\n/g, " ")}`);
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("❌ WhatsApp check error:", err.message);
  }

  console.log("\n=================================================");
}

checkFast2SmsStatus();
