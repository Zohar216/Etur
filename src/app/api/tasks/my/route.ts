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

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const tasksResult = await sql`
      SELECT DISTINCT
        t.id,
        t.title,
        t.description,
        t.domain,
        t.topic,
        t."leaderId",
        t."dueDate",
        t.priority,
        t.status,
        t."createdAt",
        u.name as leader_name,
        u.email as leader_email
      FROM "task" t
      LEFT JOIN "user" u ON t."leaderId" = u.id
      LEFT JOIN "taskUser" tu ON t.id = tu."taskId"
      WHERE t."leaderId" = ${userId} OR tu."userId" = ${userId}
      ORDER BY t."createdAt" DESC
    `;

    const tasksWithCollaborators = await Promise.all(
      tasksResult.map(async (task) => {
        const collaborators = await sql`
          SELECT 
            u.id,
            u.name,
            u.email,
            tu.role
          FROM "taskUser" tu
          LEFT JOIN "user" u ON tu."userId" = u.id
          WHERE tu."taskId" = ${task.id}
        `;

        return {
          ...task,
          collaborators: collaborators || [],
        };
      }),
    );

    return NextResponse.json(
      { tasks: tasksWithCollaborators },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=60",
        },
      },
    );
  } catch (error) {
    console.error("Get my tasks error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
