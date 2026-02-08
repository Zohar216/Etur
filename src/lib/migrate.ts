import { readFileSync } from "fs";
import { join } from "path";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

export async function runMigration(migrationFileName: string) {
  try {
    const migrationPath = join(process.cwd(), "drizzle", migrationFileName);
    const migrationSQL = readFileSync(migrationPath, "utf-8");

    const statements = migrationSQL
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      await sql.unsafe(statement);
    }

    console.log(`Migration ${migrationFileName} completed successfully`);
    await sql.end();
  } catch (error) {
    console.error("Migration error:", error);
    await sql.end();
    throw error;
  }
}
