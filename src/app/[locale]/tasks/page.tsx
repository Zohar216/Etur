"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type Task = {
  id: string;
  title: string;
  description: string | null;
  domain: string;
  topic: string;
  leaderId: string;
  leader_name: string | null;
  leader_email: string;
  dueDate: string | null;
  priority: string;
  status: string;
  createdAt: string;
  collaborators: Array<{
    id: string;
    name: string | null;
    email: string;
    role: string;
  }>;
};

const priorityColors = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const priorityLabels = {
  low: "נמוכה",
  medium: "בינונית",
  high: "גבוהה",
};

export default function TasksPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/tasks");
        if (response.ok) {
          const data = await response.json();
          setTasks(data.tasks || []);
        }
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p>טוען משימות...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">ניהול משימות</h1>
        {session && (
          <Link href="/tasks/new">
            <Button>יצירת משימה חדשה</Button>
          </Link>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground mb-4">אין משימות עדיין</p>
          {session && (
            <Link href="/tasks/new">
              <Button>צור משימה ראשונה</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="mb-2 text-xl font-semibold">{task.title}</h2>
                  {task.description && (
                    <p className="text-muted-foreground mb-2 text-sm">
                      {task.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span>
                      <strong>תחום:</strong> {task.domain}
                    </span>
                    <span>
                      <strong>נושא:</strong> {task.topic}
                    </span>
                    <span>
                      <strong>מוביל:</strong>{" "}
                      {task.leader_name || task.leader_email}
                    </span>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    priorityColors[
                      task.priority as keyof typeof priorityColors
                    ] || priorityColors.medium
                  }`}
                >
                  {priorityLabels[
                    task.priority as keyof typeof priorityLabels
                  ] || task.priority}
                </span>
              </div>

              {task.dueDate && (
                <div className="mb-2 text-sm">
                  <strong>תאריך יעד:</strong>{" "}
                  {new Date(task.dueDate).toLocaleDateString("he-IL", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}

              {task.collaborators &&
                task.collaborators.length > 0 &&
                Array.isArray(task.collaborators) && (
                  <div className="mt-4">
                    <strong className="text-sm">שותפים:</strong>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {task.collaborators.map((collab) => (
                        <span
                          key={collab.id}
                          className="rounded-full bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800"
                        >
                          {collab.name || collab.email}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              <div className="mt-4 text-xs text-gray-500">
                נוצר ב-{" "}
                {new Date(task.createdAt).toLocaleDateString("he-IL", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
