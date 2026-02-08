"use client";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { TaskCard } from "@/components/task-card";
import type { Task } from "@/lib/task-types";
import { statusConfig } from "@/lib/task-config";

type KanbanBoardProps = {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onCollaboratorsClick: (task: Task, e: React.MouseEvent) => void;
  onCreateTask?: (domain?: string) => void;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
  showCreateButton?: boolean;
};

export const KanbanBoard = ({
  tasks,
  onTaskClick,
  onCollaboratorsClick,
  onCreateTask,
  onDragStart,
  showCreateButton = true,
}: KanbanBoardProps) => {
  const tasksBySection: Record<string, Task[]> = {};

  tasks.forEach((task) => {
    const section = task.section || "כללי";
    if (!tasksBySection[section]) {
      tasksBySection[section] = [];
    }
    tasksBySection[section].push(task);
  });

  Object.keys(tasksBySection).forEach((section) => {
    tasksBySection[section].sort((a, b) => {
      const orderA = statusConfig[a.status as keyof typeof statusConfig]?.order ?? statusConfig.pending.order;
      const orderB = statusConfig[b.status as keyof typeof statusConfig]?.order ?? statusConfig.pending.order;
      return orderA - orderB;
    });
  });

  const sectionOrder = ["מיצוב", "איתור", "כללי"];
  const sortedSections = Object.keys(tasksBySection).sort((a, b) => {
    const indexA = sectionOrder.indexOf(a);
    const indexB = sectionOrder.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });

  if (tasks.length === 0) {
    return (
      <div className="flex-1 rounded-lg border bg-card p-12 text-center">
        <p className="text-muted-foreground mb-4">
          אין משימות
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
      {sortedSections.map((section) => {
        const sectionTasks = tasksBySection[section] || [];
        const uniqueDomains = Array.from(new Set(sectionTasks.map(t => t.domain)));

        return (
          <div
            key={section}
            className="flex min-w-[320px] max-w-[320px] flex-col rounded-lg border-2 border-border bg-card shadow-md"
          >
            <div className="border-b-2 border-border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground">{section}</h2>
                  <span className="rounded-full border-2 border-border bg-background text-foreground px-2.5 py-1 text-xs font-bold shadow-sm">
                    {sectionTasks.length}
                  </span>
                </div>
                {showCreateButton && onCreateTask && uniqueDomains.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    aria-label="הוסף משימה"
                    onClick={() => onCreateTask(uniqueDomains[0])}
                  >
                    <Icons.plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {uniqueDomains.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {uniqueDomains.join(", ")}
                </p>
              )}
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4 max-h-[calc(100vh-280px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {sectionTasks.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground text-sm">
                    אין משימות
                  </p>
                </div>
              ) : (
                sectionTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => onTaskClick(task)}
                    onCollaboratorsClick={(e) => onCollaboratorsClick(task, e)}
                    draggable={!!onDragStart}
                    onDragStart={onDragStart ? (e) => onDragStart(e, task.id) : undefined}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
