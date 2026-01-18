import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

const defaultDomains = ["פיתוח", "שיווק", "תמיכה", "מכירות", "ניהול"];

export async function seedDomains() {
  try {
    for (const domainName of defaultDomains) {
      await sql`
        INSERT INTO "domain" (id, name)
        VALUES (gen_random_uuid(), ${domainName})
        ON CONFLICT (name) DO NOTHING
      `;
    }
    console.log("Domains seeded successfully");
  } catch (error) {
    console.error("Error seeding domains:", error);
    throw error;
  } finally {
    await sql.end();
  }
}
