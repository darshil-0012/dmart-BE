import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for database connection.");
}

export const pool = mysql.createPool({ uri: process.env.DATABASE_URL });

export const db = drizzle({ client: pool, schema, mode: "default" });

export async function verifyDatabaseConnection(): Promise<void> {
  let connection: mysql.PoolConnection | undefined;
  try {
    connection = await pool.getConnection();
    await connection.ping();
  } finally {
    connection?.release();
  }
}
