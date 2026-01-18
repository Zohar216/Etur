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
  const tasksByDomain: Record<string, Task[]> = {};

  tasks.forEach((task) => {
    const domain = task.domain;
    if (!tasksByDomain[domain]) {
      tasksByDomain[domain] = [];
    }
    tasksByDomain[domain].push(task);
  });

  Object.keys(tasksByDomain).forEach((domain) => {
    tasksByDomain[domain].sort((a, b) => {
      const orderA = statusConfig[a.status as keyof typeof statusConfig]?.order ?? statusConfig.pending.order;
      const orderB = statusConfig[b.status as keyof typeof statusConfig]?.order ?? statusConfig.pending.order;
      return orderA - orderB;
    });
  });

  const sortedDomains = Object.keys(tasksByDomain).sort();

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
      {sortedDomains.map((domain) => {
        const domainTasks = tasksByDomain[domain] || [];
        return (
          <div
            key={domain}
            className="flex min-w-[320px] max-w-[320px] flex-col rounded-lg border bg-white shadow-sm"
          >
            <div className="border-b bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">{domain}</h2>
                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {domainTasks.length}
                  </span>
                </div>
                {showCreateButton && onCreateTask && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    aria-label="הוסף משימה"
                    onClick={() => onCreateTask(domain)}
                  >
                    <Icons.plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4 max-h-[calc(100vh-280px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {domainTasks.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground text-sm">
                    אין משימות
                  </p>
                </div>
              ) : (
                domainTasks.map((task) => (
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
