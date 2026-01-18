import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";

import { auth } from "@/lib/auth";

const sql = postgres(process.env.DATABASE_URL!, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await sql`
      SELECT role FROM "user" WHERE id = ${session.user.id} LIMIT 1
    `;

    if (!currentUser || currentUser.length === 0 || currentUser[0].role !== "מנהל") {
      return NextResponse.json(
        { error: "רק מנהל יכול לשנות תפקידים" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { role } = body;

    if (!role || !["מנהל", "חפ״ש"].includes(role)) {
      return NextResponse.json(
        { error: "תפקיד לא תקין. אפשר לבחור רק 'מנהל' או 'חפ״ש'" },
        { status: 400 },
      );
    }

    const userId = params.id;

    const updatedUser = await sql`
      UPDATE "user"
      SET role = ${role}
      WHERE id = ${userId}
      RETURNING id, email, role
    `;

    if (updatedUser.length === 0) {
      return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "תפקיד המשתמש עודכן בהצלחה", user: updatedUser[0] },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update user role error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
