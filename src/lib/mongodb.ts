import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable in .env.local");
}

/**
 * Global cache to avoid creating a new connection on every hot-reload / lambda
 * invocation in dev and serverless environments.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  legacyIndexesChecked: boolean;
  electricityReadingsFixed: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongooseCache ?? {
  conn: null,
  promise: null,
  legacyIndexesChecked: false,
  electricityReadingsFixed: false,
};
global._mongooseCache = cached;

/**
 * Self-healing cleanup: older versions of this app had GLOBAL unique
 * indexes on AccountType.type, AccountType.serial, Account.code,
 * CashVoucher.serialNumber, and JournalVoucher.serialNumber. Per-user
 * accounts replaced those with compound {userId, ...} indexes, but
 * MongoDB never drops an old index on its own — Mongoose only ever
 * *adds* indexes, it never removes ones that are no longer declared in
 * the schema. If a leftover old index survives, it silently blocks any
 * second user from ever using the same account type name, account code,
 * or voucher number as an existing record — MongoDB rejects the insert
 * with a duplicate-key error even though it's only a duplicate across
 * *different* users, which is supposed to be allowed now.
 *
 * This runs automatically once per server process, using the exact same
 * connection (and therefore the exact same database) the rest of the app
 * uses — so there's no separate script to run, and no risk of it checking
 * a different .env file or a different database than the live app.
 */
async function dropLegacyIndexes(conn: typeof mongoose) {
  const LEGACY_INDEXES: Record<string, string[]> = {
    accounttypes: ["type_1", "serial_1"],
    accounts: ["code_1"],
    cashvouchers: ["serialNumber_1"],
    journalvouchers: ["serialNumber_1"],
  };

  const db = conn.connection.db;
  if (!db) return;

  for (const [collectionName, indexNames] of Object.entries(LEGACY_INDEXES)) {
    try {
      const exists = await db.listCollections({ name: collectionName }).toArray();
      if (exists.length === 0) continue;

      const currentIndexes = await db.collection(collectionName).indexes();
      for (const idxName of indexNames) {
        const found = currentIndexes.find((i) => i.name === idxName);
        if (found) {
          await db.collection(collectionName).dropIndex(idxName);
          console.log(`[mongodb] dropped legacy index ${collectionName}.${idxName}`);
        }
      }
    } catch (err) {
      // Non-fatal — never block app startup over index cleanup.
      console.error(`[mongodb] could not check/drop legacy indexes on ${collectionName}:`, err);
    }
  }
}

/**
 * Self-healing repair: older electricityreadings documents were saved
 * under a previous schema version and are missing a valid `reading`
 * field, which the app now requires to show Unit Spend. Rather than
 * assume the exact old field name (a prior guess of `endReading` didn't
 * match every document), this recovers a value from whichever numeric
 * field is actually present — checking `endReading` and `startReading`
 * first since those are the known former names, then falling back to
 * scanning any other numeric field on the document as a last resort.
 * Runs automatically on every server start, using the app's own live
 * connection — no script to run, no output to check.
 */
async function fixElectricityReadings(conn: typeof mongoose) {
  const db = conn.connection.db;
  if (!db) return;

  try {
    const exists = await db.listCollections({ name: "electricityreadings" }).toArray();
    if (exists.length === 0) return;

    const collection = db.collection("electricityreadings");
    const broken = await collection
      .find({ $or: [{ reading: { $exists: false } }, { reading: null }] })
      .toArray();

    if (broken.length === 0) return;

    const skipFields = new Set([
      "_id",
      "__v",
      "userId",
      "date",
      "withMotor",
      "createdAt",
      "updatedAt",
      "reading",
    ]);

    let fixedCount = 0;
    for (const doc of broken) {
      let recovered: number | null = null;

      if (typeof doc.endReading === "number") {
        recovered = doc.endReading;
      } else if (typeof doc.startReading === "number") {
        recovered = doc.startReading;
      } else {
        for (const [key, value] of Object.entries(doc)) {
          if (skipFields.has(key)) continue;
          if (typeof value === "number") {
            recovered = value;
            break;
          }
        }
      }

      if (recovered !== null) {
        await collection.updateOne(
          { _id: doc._id },
          { $set: { reading: recovered }, $unset: { startReading: "", endReading: "" } }
        );
        fixedCount++;
      } else {
        console.error(
          `[mongodb] electricityreadings ${doc._id}: no numeric field found to recover a reading from — left as-is:`,
          doc
        );
      }
    }

    if (fixedCount > 0) {
      console.log(`[mongodb] recovered ${fixedCount} electricity reading document(s)`);
    }
  } catch (err) {
    console.error("[mongodb] could not fix electricity readings:", err);
  }
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  if (!cached.legacyIndexesChecked) {
    cached.legacyIndexesChecked = true;
    await dropLegacyIndexes(cached.conn);
  }

  if (!cached.electricityReadingsFixed) {
    cached.electricityReadingsFixed = true;
    await fixElectricityReadings(cached.conn);
  }

  return cached.conn;
}
