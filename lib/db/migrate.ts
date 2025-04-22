// import "dotenv/config";
// import { neon } from "@neondatabase/serverless";
// import { drizzle } from "drizzle-orm/neon-http";
// import { migrate } from "drizzle-orm/neon-http/migrator";

// const sql = neon(process.env.DATABASE_URL);
// const db = drizzle(sql);

// const makeMigrations = async () => {
//   try {
//     console.log("🎯💈 Starting database migration...💈🎯");
//     await migrate(db, {
//       migrationsFolder: "src/db/migrations",
//     });
//     console.log("✅ Database migration completed successfully.");
//   } catch (error) {
//     console.error("❌ Error during database migration:", error);
//   }
// };

// makeMigrations();
import dotenv from "dotenv";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./index";
//import { getNucleusDb } from "./index";

dotenv.config({ path: ".env" });

export async function migrateFn() {
    //const { pgClient, drizzleDb } = await getNucleusDb(migrationSchema);
        await migrate(db, {
            migrationsFolder: "drizzle",
            //migrationsTable: "drizzle_migrations",
        });
        console.log("migrations completed!");
}

async function main() {
    try {
        console.log("Starting global migrations...");

        await migrateFn();

        console.log("All migrations completed!");
    } catch (error) {
        throw new Error(`Global migrations failed: ${error}`)
    }
}

main();