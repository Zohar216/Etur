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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status || !["pending", "in-progress", "completed"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be pending, in-progress, or completed" },
        { status: 400 },
      );
    }

    await sql`
      UPDATE "task"
      SET status = ${status}, "updatedAt" = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json(
      { message: "Task status updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update task status error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
