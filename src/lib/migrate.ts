import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { join } from "path";

const sql = neon(process.env.DATABASE_URL!);

export async function runMigration() {
  try {
    const migrationPath = join(
      process.cwd(),
      "drizzle",
      "0003_add_password_to_user.sql",
    );
    const migrationSQL = readFileSync(migrationPath, "utf-8");

    const statements = migrationSQL
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      await sql(statement);
    }

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration error:", error);
    throw error;
  }
}
