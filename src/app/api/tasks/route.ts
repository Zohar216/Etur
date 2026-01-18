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

    const tasksResult = await sql`
      SELECT 
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
    console.error("Get tasks error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      domain,
      topic,
      leaderId,
      dueDate,
      priority,
      collaboratorIds,
    } = body;

    if (!title || !domain || !topic || !leaderId) {
      return NextResponse.json(
        { error: "Title, domain, topic, and leader are required" },
        { status: 400 },
      );
    }

    if (!["low", "medium", "high"].includes(priority)) {
      return NextResponse.json(
        { error: "Priority must be low, medium, or high" },
        { status: 400 },
      );
    }

    const taskId = crypto.randomUUID();

    await sql`
      INSERT INTO "task" (
        id, title, description, domain, topic, "leaderId", "dueDate", priority, status
      )
      VALUES (
        ${taskId},
        ${title},
        ${description || null},
        ${domain},
        ${topic},
        ${leaderId},
        ${dueDate ? new Date(dueDate) : null},
        ${priority || "medium"},
        'pending'
      )
    `;

    if (
      collaboratorIds &&
      Array.isArray(collaboratorIds) &&
      collaboratorIds.length > 0
    ) {
      for (const userId of collaboratorIds) {
        await sql`
          INSERT INTO "taskUser" ("taskId", "userId", role)
          VALUES (${taskId}, ${userId}, 'collaborator')
          ON CONFLICT DO NOTHING
        `;
      }
    }

    const newTask = await sql`
      SELECT 
        t.*,
        u.name as leader_name,
        u.email as leader_email
      FROM "task" t
      LEFT JOIN "user" u ON t."leaderId" = u.id
      WHERE t.id = ${taskId}
    `;

    return NextResponse.json(
      { message: "Task created successfully", task: newTask[0] },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
