import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";

import { auth } from "@/lib/auth";

const sql = postgres(process.env.DATABASE_URL!, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await sql`
      SELECT id, name, email, image, "isActive", role
      FROM "user"
      ORDER BY name, email
    `;

    return NextResponse.json(
      { users },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
