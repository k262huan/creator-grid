import "server-only";

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { z } from "zod";

import * as schema from "./schema";

const databaseUrlSchema = z.string().refine((value) => {
  try {
    const url = new URL(value);
    return (url.protocol === "postgres:" || url.protocol === "postgresql:") && url.searchParams.get("sslmode") === "require";
  } catch {
    return false;
  }
}, "DATABASE_URL must be a PostgreSQL URL with sslmode=require");

export function parseDatabaseUrl(input: unknown): string {
  const result = databaseUrlSchema.safeParse(input);
  if (!result.success) {
    throw new Error("DATABASE_URL is missing or invalid; expected a PostgreSQL URL with sslmode=require");
  }
  return result.data;
}

function getDatabaseUrl(): string {
  return parseDatabaseUrl(process.env.DATABASE_URL);
}

function createDatabase() {
  const pool = new Pool({ connectionString: getDatabaseUrl(), max: 1 });
  return drizzle(pool, { schema });
}

export type Database = ReturnType<typeof createDatabase>;

let database: Database | undefined;

export function getDb(): Database {
  database ??= createDatabase();
  return database;
}
