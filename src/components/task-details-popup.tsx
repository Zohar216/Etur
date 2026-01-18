"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { getPriorityConfig, statusConfig } from "@/lib/task-config";
import type { Task } from "@/lib/task-types";

type TaskDetailsPopupProps = {
  task: Task;
  onClose: () => void;
  onCollaboratorsClick?: (task: Task, e: React.MouseEvent) => void;
};

export const TaskDetailsPopup = ({
  task,
  onClose,
  onCollaboratorsClick,
}: TaskDetailsPopupProps) => {
  const status = statusConfig[task.status as keyof typeof statusConfig] || statusConfig.pending;
  const priority = getPriorityConfig(task.priority || "medium");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative rounded-xl border border-border bg-background p-0 shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border">
          <div className="mb-2">
            <p className="text-muted-foreground text-xs mb-1">
              {task.domain} <Icons.chevronLeft className="inline h-3 w-3 mx-1" /> {task.topic}
            </p>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{task.title}</h2>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors -mt-6"
                aria-label="סגור"
              >
                <Icons.x className="h-5 w-5" />
              </button>
              <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium mt-1 ${status.color}`}>
                {status.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-0">
            <div className="p-6 border-l border-border">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-foreground">תיאור המשימה</h3>
                  <div className="rounded-lg border border-border bg-slate-50/50 dark:bg-slate-900/50 p-4">
                    <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                      {task.description || "אין תיאור למשימה זו"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6 bg-slate-50/30 dark:bg-slate-900/30">
              <div className="flex items-start gap-3">
                <Icons.user className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">מוביל המשימה</p>
                  <div className="flex items-center gap-2">
                    <Avatar
                      name={task.leader_name}
                      email={task.leader_email}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {task.leader_name || task.leader_email}
                      </p>
                      {task.leader_name && (
                        <p className="text-muted-foreground text-xs truncate">
                          {task.leader_email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {task.collaborators && task.collaborators.length > 0 && (
                <div className="flex items-start gap-3">
                  <Icons.user className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">שותפים</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {task.collaborators.map((collab, index) => (
                          <div
                            key={collab.id}
                            className="relative"
                            style={{ marginRight: index > 0 ? "-8px" : "0" }}
                            title={collab.name || collab.email}
                          >
                            <Avatar
                              name={collab.name}
                              email={collab.email}
                              size="sm"
                              className="border-2 border-background"
                            />
                          </div>
                        ))}
                      </div>
                      {onCollaboratorsClick && (
                        <button
                          onClick={(e) => onCollaboratorsClick(task, e)}
                          className="text-muted-foreground hover:text-foreground text-xs transition-colors"
                        >
                          {task.collaborators.length} שותפים
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {task.dueDate && (
                <div className="flex items-start gap-3">
                  <Icons.calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">תאריך יעד</p>
                    <p className={`text-sm ${
                      new Date(task.dueDate) < new Date()
                        ? "text-red-600 dark:text-red-400"
                        : "text-foreground"
                    }`}>
                      {new Date(task.dueDate).toLocaleDateString("he-IL", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Icons.signal className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">דחיפות</p>
                  <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${priority.color}`}>
                    {priority.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border flex items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs flex-1">
            נוצר ב{" "}
            <span className="text-foreground">
              {new Date(task.createdAt).toLocaleDateString("he-IL", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
            >
              סגור
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
