import mongoose from "mongoose";

// Required env var: MONGODB_URL (same database as the Gigsar website)
export async function connectToDB() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGODB_URL) {
    throw new Error("MONGODB_URL must be set");
  }
  await mongoose.connect(process.env.MONGODB_URL, {
    dbName: process.env.MONGODB_DB || "test",
  });
}
