/**
 * One-time fix: your ElectricityReading collection has old documents
 * saved under the previous schema (startReading + endReading fields, no
 * `reading` field). The app now expects a single `reading` field per
 * entry. This script finds any document missing `reading` and sets
 * reading = endReading (the most sensible mapping — "end reading" was
 * effectively the meter's value at that point), then removes the old
 * startReading/endReading fields so the documents match the current
 * schema cleanly.
 *
 * Run once with:
 *   node scripts/migrate-electricity-readings.js
 *
 * Safe to run more than once — it only touches documents that still have
 * the old shape (missing `reading`), so already-migrated documents are
 * left untouched.
 */
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

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
    process.env[key] = value;
  }
  return true;
}

const loadedEnv = loadEnvFile(".env");
const loadedEnvLocal = loadEnvFile(".env.local");
console.log(
  `Loaded env from: ${[loadedEnv && ".env", loadedEnvLocal && ".env.local"].filter(Boolean).join(", ") || "(nothing found!)"}`
);

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found in .env or .env.local.");
    process.exit(1);
  }

  console.log(`Connecting to: ${uri.replace(/:\/\/[^@]+@/, "://<credentials>@")}`);
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  console.log(`Connected to database: "${db.databaseName}"\n`);

  const collection = db.collection("electricityreadings");

  const oldShaped = await collection
    .find({
      reading: { $exists: false },
      endReading: { $exists: true },
    })
    .toArray();

  if (oldShaped.length === 0) {
    console.log("No old-shaped documents found — nothing to migrate.");
    await mongoose.disconnect();
    return;
  }

  console.log(`Found ${oldShaped.length} document(s) to migrate:\n`);

  for (const doc of oldShaped) {
    console.log(
      `  ${doc.date?.toISOString?.().slice(0, 10) || doc.date}  endReading=${doc.endReading} -> reading=${doc.endReading}`
    );
    await collection.updateOne(
      { _id: doc._id },
      {
        $set: { reading: doc.endReading },
        $unset: { startReading: "", endReading: "" },
      }
    );
  }

  console.log(`\nDone — migrated ${oldShaped.length} document(s).`);
  console.log("Refresh the Electricity page — Unit Spend should now compute correctly.");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
