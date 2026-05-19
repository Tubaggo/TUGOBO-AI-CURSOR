import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// DATABASE_URL is the Supabase direct connection string (not pooler)
// for migrations. Use the pooler URL in production API routes.
function createClient() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    // Return null until runtime configuration is available.
    // Callers that require the database must guard with `if (db)` or a local assert.
    return null;
  }

  return drizzle(postgres(url, { prepare: false }), { schema });
}

export const db = createClient();

// Non-nullable type alias for use-sites that have already checked `db != null`
export type DB = NonNullable<typeof db>;
