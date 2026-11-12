import fs from "node:fs";
import path from "node:path";
import { execFileSync, execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ZERO_SHA = /^0{40}$/;
const MAX_STAGED_BINARY_BYTES = 15 * 1024 * 1024; // 15 MB (allows signed ~5.3 MB APKs & ~3.5 MB OTA zips)

export const SECRET_PATTERNS = [
  {
    name: "JWT / Supabase key",
    re: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
  },
  {
    name: "Private key block",
    re: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/,
  },
  {
    name: "AWS access key",
    re: /\bAKIA[0-9A-Z]{16}\b/,
  },
  {
    name: "Hardcoded secret assignment",
    re: /\b(?:SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY|CASHFREE_CLIENT_SECRET|FAST2SMS_API_KEY|OPENAI_API_KEY)[^\S\r\n]*=[^\S\r\n]*["']?[A-Za-z0-9_./+=-]{12,}/,
  },
  {
    name: "Hardcoded Android keystore password",
    re: /\b(?:storePassword|keyPassword)\s+["'][^"']+["']/,
  },
];

const CONFLICT_MARKER_RE = /^(?:<{7} |={7}$|>{7} )/m;

const BINARY_OR_MEDIA_RE =
  /\.(png|jpg|jpeg|webp|gif|svg|ico|apk|jar|keystore|jks|zip|mp4|mov|webm|mkv|woff2?|ttf|pdf)$/i;

function isSecretScanExempt(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  return (
    normalized === ".env.example" ||
    normalized.endsWith(".test.mjs") ||
    normalized.startsWith("docs/") ||
    normalized.startsWith("archive/") ||
    BINARY_OR_MEDIA_RE.test(normalized)
  );
}

export function checkForbiddenPath(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  const base = path.posix.basename(normalized);

  if ((base === ".env" || base.startsWith(".env.")) && base !== ".env.example") {
    return `Sensitive environment file cannot be committed: ${normalized}`;
  }
  if (
    normalized === "android/keystore.properties" ||
    normalized === "android/local.properties" ||
    normalized === "android/app/google-services.json" ||
    /\.(keystore|jks)$/i.test(base)
  ) {
    return `Local Android secret/keystore config cannot be committed: ${normalized}`;
  }
  if (
    normalized.startsWith("scratch/") ||
    normalized.startsWith(".next/") ||
    normalized.startsWith("node_modules/") ||
    normalized.startsWith("android-customer-bundle/") ||
    normalized.startsWith("android-embedded-bundle/") ||
    normalized.startsWith("android-rider-bundle/") ||
    normalized.startsWith("android/app/build/") ||
    normalized.startsWith("android/.gradle/") ||
    /^temp_.*\.(png|html)$/i.test(base) ||
    /^loom/i.test(base)
  ) {
    return `Temporary or build artifact directory/file cannot be committed: ${normalized}`;
  }
  return null;
}

export function scanTextForViolations(filePath, content) {
  const violations = [];
  const normalized = filePath.replace(/\\/g, "/");

  if (!BINARY_OR_MEDIA_RE.test(normalized) && CONFLICT_MARKER_RE.test(content)) {
    violations.push(`Unresolved git merge conflict marker: ${normalized}`);
  }

  if (!isSecretScanExempt(normalized)) {
    for (const { name, re } of SECRET_PATTERNS) {
      if (re.test(content)) {
        violations.push(`${name}: ${normalized}`);
      }
    }
  }

  return violations;
}

function getStagedFiles() {
  const raw = execSync("git diff --cached --name-only --diff-filter=ACMR -z", {
    encoding: "utf8",
  });
  return raw.split("\0").filter(Boolean);
}

function getTrackedFiles() {
  const raw = execSync("git ls-files -z", { encoding: "utf8" });
  return raw.split("\0").filter(Boolean);
}

function readStagedContent(filePath) {
  return execFileSync("git", ["show", `:${filePath}`], {
    maxBuffer: MAX_STAGED_BINARY_BYTES + 1024 * 1024,
  });
}

function runCommand(command, extraEnv = {}) {
  console.log(`\n▶ Running: ${command}`);
  execSync(command, {
    stdio: "inherit",
    env: { ...process.env, ...extraEnv },
  });
}

export function runSecretScanOnTracked() {
  const files = getTrackedFiles();
  const findings = [];

  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const stat = fs.statSync(file);
    if (!stat.isFile()) continue;
    const content = fs.readFileSync(file, "utf8");
    findings.push(...scanTextForViolations(file, content));
  }

  if (findings.length > 0) {
    console.error("\n❌ Secret / conflict scan FAILED:");
    for (const f of findings) console.error(" -", f);
    process.exit(1);
  }
  console.log(`✔ Secret & conflict scan passed (${files.length} tracked files checked).`);
}

function runPreCommit() {
  const staged = getStagedFiles();
  if (staged.length === 0) {
    console.log("✔ No staged files to check.");
    return;
  }

  const errors = [];
  for (const file of staged) {
    const pathErr = checkForbiddenPath(file);
    if (pathErr) {
      errors.push(pathErr);
      continue;
    }

    const buf = readStagedContent(file);
    if (buf.length > MAX_STAGED_BINARY_BYTES) {
      errors.push(
        `Staged file exceeds ${(MAX_STAGED_BINARY_BYTES / (1024 * 1024)).toFixed(0)} MB limit (${(
          buf.length /
          (1024 * 1024)
        ).toFixed(2)} MB): ${file}`,
      );
      continue;
    }

    if (!BINARY_OR_MEDIA_RE.test(file) && !buf.includes(0)) {
      errors.push(...scanTextForViolations(file, buf.toString("utf8")));
    }
  }

  if (errors.length > 0) {
    console.error("\n❌ PRE-COMMIT BLOCKED! Fix these issues before committing:");
    for (const err of errors) console.error(" -", err);
    process.exit(1);
  }
  console.log(`✔ Pre-commit guard passed (${staged.length} staged file(s) clean).`);
}

function getChangedFilesForPush() {
  let stdin = "";
  try {
    stdin = fs.readFileSync(0, "utf8").trim();
  } catch {}
  if (!stdin) return null;

  const changed = new Set();
  for (const line of stdin.split(/\r?\n/)) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 4) continue;
    const [, localSha, , remoteSha] = parts;
    if (!localSha || ZERO_SHA.test(localSha)) continue;

    let range = ZERO_SHA.test(remoteSha) ? null : `${remoteSha}..${localSha}`;
    if (!range) {
      try {
        const mergeBase = execSync(`git merge-base origin/main ${localSha}`, {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "ignore"],
        }).trim();
        if (mergeBase) range = `${mergeBase}..${localSha}`;
      } catch {}
    }

    if (range) {
      const files = execSync(`git diff --name-only ${range}`, { encoding: "utf8" })
        .split(/\r?\n/)
        .filter(Boolean);
      for (const f of files) changed.add(f.replace(/\\/g, "/"));
    }
  }
  return [...changed];
}

function runPreflight({ includeAndroidLint = false } = {}) {
  console.log("🛡️ Trustit Preflight Gate starting (zero checks bypassed)...");
  runSecretScanOnTracked();

  const pnpmCmd = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  runCommand(`${pnpmCmd} typecheck`);
  runCommand(`${pnpmCmd} test`);
  runCommand(`${pnpmCmd} test:cashfree`);

  const buildEnv = {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "placeholder-publishable-key",
  };
  runCommand(`${pnpmCmd} build`, buildEnv);

  if (includeAndroidLint) {
    const androidDir = path.join(process.cwd(), "android");
    const gradlew = process.platform === "win32" ? ".\\gradlew.bat" : "./gradlew";
    console.log("\n▶ Android native files changed — running release lint across all 3 flavors...");
    execSync(
      `${gradlew} lintCustomerRelease lintPartnerRelease lintRiderRelease --no-daemon`,
      { cwd: androidDir, stdio: "inherit" },
    );
  }

  console.log("\n✅ All preflight safety gates PASSED.");
}

function runPrePush() {
  const changed = getChangedFilesForPush();
  if (Array.isArray(changed) && changed.length === 0) {
    console.log("✔ Nothing new to push.");
    return;
  }

  const androidTouched =
    Array.isArray(changed) &&
    changed.some((f) => f.startsWith("android/") || f === "capacitor.config.json");

  runPreflight({ includeAndroidLint: androidTouched });
}

const isCli =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isCli) {
  const cmd = process.argv[2] || "preflight";
  if (cmd === "pre-commit") runPreCommit();
  else if (cmd === "pre-push") runPrePush();
  else if (cmd === "secret-scan") runSecretScanOnTracked();
  else if (cmd === "preflight") runPreflight({ includeAndroidLint: process.argv.includes("--android") });
  else {
    console.error(`Unknown git-guard command: ${cmd}`);
    process.exit(1);
  }
}
