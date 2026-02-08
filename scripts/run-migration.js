const { readFileSync, existsSync } = require("fs");
const { join } = require("path");
const postgres = require("postgres");

function loadEnvFile(filePath) {
  if (existsSync(filePath)) {
    const content = readFileSync(filePath, "utf-8");
    content.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          const value = valueParts.join("=").replace(/^["']|["']$/g, "");
          process.env[key.trim()] = value.trim();
        }
      }
    });
  }
}

loadEnvFile(join(process.cwd(), ".env.local"));
loadEnvFile(join(process.cwd(), ".env"));

const migrationFile = process.argv[2] || "0007_add_task_hierarchy_and_discussion.sql";

if (!migrationFile) {
  console.error("Usage: node scripts/run-migration.js <migration-file-name>");
  console.error("Example: node scripts/run-migration.js 0007_add_task_hierarchy_and_discussion.sql");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL is not set. Please check your .env file.");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

async function runMigration() {
  try {
    const migrationPath = join(process.cwd(), "drizzle", migrationFile);
    const migrationSQL = readFileSync(migrationPath, "utf-8");

    const statements = migrationSQL
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      await sql.unsafe(statement);
    }

    console.log(`Migration ${migrationFile} completed successfully`);
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    await sql.end();
    process.exit(1);
  }
}

runMigration();
