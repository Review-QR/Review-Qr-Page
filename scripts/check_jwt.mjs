import fs from "fs";
const envFile = fs.readFileSync(".env.production.local", "utf8");
for (const line of envFile.split("\n")) {
  if (line.includes("KEY=") || line.includes("TOKEN=")) {
    const [k, v] = line.split("=");
    const key = (v || "").trim().replace(/^["'\s]+|["'\s]+$/g, "");
    const parts = key.split(".");
    if (parts.length === 3) {
      try {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
        console.log(k.trim(), "is JWT, role:", payload.role);
      } catch (e) {
        console.log(k.trim(), "invalid JWT");
      }
    } else {
      console.log(k.trim(), "not a JWT, len:", key.length);
    }
  }
}
