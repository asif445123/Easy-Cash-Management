/**
 * Read-only diagnostic — prints every document in the electricityreadings
 * collection exactly as stored, so we can see the real field names/shape
 * instead of guessing. Does not change anything.
 *
 * Run with: node scripts/list-electricity-readings.js
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

  const docs = await db
    .collection("electricityreadings")
    .find({})
    .sort({ date: 1 })
    .toArray();

  console.log(`Found ${docs.length} document(s):\n`);
  for (const d of docs) {
    console.log(JSON.stringify(d, null, 2));
    console.log("---");
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
