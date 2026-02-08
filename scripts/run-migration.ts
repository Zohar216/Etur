import { runMigration } from "../src/lib/migrate";

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error("Usage: tsx scripts/run-migration.ts <migration-file-name>");
  console.error("Example: tsx scripts/run-migration.ts 0007_add_task_hierarchy_and_discussion.sql");
  process.exit(1);
}

runMigration(migrationFile)
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  });
