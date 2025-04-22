import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create a drizzle instance using the pool
export const db = drizzle(pool);