import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// DATABASE_URL is the Supabase direct connection string (not pooler)
// for migrations. Use the pooler URL in production API routes.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const queryClient = postgres(connectionString, { prepare: false });

export const db = drizzle(queryClient, { schema });
export type DB = typeof db;
