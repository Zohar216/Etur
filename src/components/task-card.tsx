"use client";

import { Avatar } from "@/components/avatar";
import { getPriorityConfig, getStatusColor } from "@/lib/task-config";
import type { Task } from "@/lib/task-types";

type TaskCardProps = {
  task: Task;
  onClick: () => void;
  onCollaboratorsClick?: (e: React.MouseEvent) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
};

export const TaskCard = ({
  task,
  onClick,
  onCollaboratorsClick,
  draggable = false,
  onDragStart,
}: TaskCardProps) => {
  const statusColor = getStatusColor(task.status || "pending");
  const priority = getPriorityConfig(task.priority || "medium");

  return (
    <div
      className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer"
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
    >
      <div
        className={`absolute right-0 top-0 h-full w-1.5 ${statusColor}`}
      />

      <div className="absolute left-2 top-2 z-10">
        <span className={`rounded-md px-2 py-0.5 text-xs font-medium shadow-sm ${priority.color}`}>
          {priority.label}
        </span>
      </div>

      <div className="pr-3">
        <h3 className="mb-2 font-semibold leading-tight">
          {task.title}
        </h3>

        {task.description && (
          <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">
            {task.description}
          </p>
        )}

        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
            {task.topic}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div
            className="relative flex items-center gap-1 cursor-pointer"
            onClick={onCollaboratorsClick}
          >
            {task.collaborators && task.collaborators.length > 0 ? (
              task.collaborators.map((collab, index) => (
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
                    className="border-2 border-white"
                  />
                </div>
              ))
            ) : (
              <span className="text-muted-foreground text-xs">
                אין שותפים
              </span>
            )}
          </div>
          {task.dueDate && (
            <span className="text-muted-foreground text-xs">
              {new Date(task.dueDate).toLocaleDateString(
                "he-IL",
                {
                  month: "short",
                  day: "numeric",
                },
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
