/**
 * One-time fix: drops the OLD global-unique indexes on AccountType, Account,
 * CashVoucher, and JournalVoucher that predate per-user accounts. Those old
 * indexes (e.g. a unique index on `serial` alone) block every user after
 * the first from saving — MongoDB rejects the insert with a duplicate-key
 * error even though the value is only a duplicate across *different*
 * users, which should now be allowed.
 *
 * Run once with:
 *   node scripts/fix-legacy-indexes.js
 *
 * Safe to run more than once — it just skips indexes that are already gone.
 */
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

// Loads env files the same way Next.js does: .env first, then .env.local
// overrides it. Most Next.js projects put the real MONGODB_URI in
// .env.local (as this project's own error message confirms), so checking
// only ".env" — like the previous version of this script did — can
// silently connect to the wrong database (or fail to connect at all),
// which is why running this before may have appeared to do nothing.
function loadEnvFile(filename) {
  const envPath = path.join(__dirname, "..", filename);
  if (!fs.existsSync(envPath)) return false;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value; // .env.local is loaded second so it can override .env
  }
  return true;
}

const loadedEnv = loadEnvFile(".env");
const loadedEnvLocal = loadEnvFile(".env.local");
console.log(
  `Loaded env from: ${[loadedEnv && ".env", loadedEnvLocal && ".env.local"].filter(Boolean).join(", ") || "(nothing found!)"}`
);

// The specific old single-field unique indexes that need to go. Mongoose's
// default naming is "<field>_1" for an ascending single-field index.
const LEGACY_INDEXES = {
  accounttypes: ["type_1", "serial_1"],
  accounts: ["code_1"],
  cashvouchers: ["serialNumber_1"],
  journalvouchers: ["serialNumber_1"],
};

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found in .env or .env.local — check your files.");
    process.exit(1);
  }

  console.log(`Connecting to: ${uri.replace(/:\/\/[^@]+@/, "://<credentials>@")}`);
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  console.log(`Connected to database: "${db.databaseName}"\n`);

  let droppedAny = false;

  for (const [collectionName, indexNames] of Object.entries(LEGACY_INDEXES)) {
    const existing = await db.listCollections({ name: collectionName }).toArray();
    if (existing.length === 0) {
      console.log(`(skip) ${collectionName} — collection doesn't exist yet`);
      continue;
    }

    const currentIndexes = await db.collection(collectionName).indexes();
    console.log(`${collectionName} currently has: ${currentIndexes.map((i) => i.name).join(", ")}`);

    for (const idxName of indexNames) {
      const found = currentIndexes.find((i) => i.name === idxName);
      if (found) {
        await db.collection(collectionName).dropIndex(idxName);
        console.log(`  ✔ dropped legacy index: ${collectionName}.${idxName}`);
        droppedAny = true;
      } else {
        console.log(`  (skip) ${collectionName}.${idxName} — already gone`);
      }
    }
  }

  if (droppedAny) {
    console.log("\nDone — legacy indexes removed. Restart your dev server");
    console.log("(npm run dev) so Mongoose creates the new per-user indexes.");
  } else {
    console.log("\nNo legacy indexes found on this database. If saving still");
    console.log("fails, run list-indexes.js and share its output.");
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
