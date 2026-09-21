/**
 * Read-only diagnostic — lists every index currently on the 4 accounting
 * collections, so we can see their real names/keys instead of guessing.
 * Does not change anything.
 *
 * Run with: node scripts/list-indexes.js
 */
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

// Loads env files the same way Next.js does: .env first, then .env.local
// overrides it. Most Next.js projects put the real MONGODB_URI in
// .env.local (as this project's own error message confirms), so checking
// only ".env" — like the previous version of this script did — can
// silently connect to the wrong database (or fail to connect at all).
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

const COLLECTIONS = ["accounttypes", "accounts", "cashvouchers", "journalvouchers"];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found in .env or .env.local — check your files.");
    process.exit(1);
  }

  // Print which cluster/database we're actually connecting to, so you can
  // visually confirm it matches what your app uses.
  console.log(`Connecting to: ${uri.replace(/:\/\/[^@]+@/, "://<credentials>@")}`);

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  console.log(`Connected to database: "${db.databaseName}"`);

  for (const name of COLLECTIONS) {
    const exists = await db.listCollections({ name }).toArray();
    console.log(`\n=== ${name} ${exists.length === 0 ? "(collection does not exist yet)" : ""} ===`);
    if (exists.length === 0) continue;

    const indexes = await db.collection(name).indexes();
    for (const idx of indexes) {
      console.log(`  name: ${idx.name}  key: ${JSON.stringify(idx.key)}  unique: ${!!idx.unique}`);
    }

    const count = await db.collection(name).countDocuments();
    console.log(`  (${count} documents in this collection)`);

    if (name === "accounttypes") {
      const sample = await db.collection(name).find({}).limit(20).toArray();
      for (const doc of sample) {
        console.log(`    doc: type="${doc.type}" userId=${doc.userId} serial=${doc.serial}`);
      }
    }
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
