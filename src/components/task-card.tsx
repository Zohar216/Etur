"use client";

import { Avatar } from "@/components/avatar";
import { Icons } from "@/components/icons";
import { getPriorityConfig, getStatusConfig } from "@/lib/task-config";
import type { Task } from "@/lib/task-types";

type TaskCardProps = {
  task: Task;
  onClick: () => void;
  onCollaboratorsClick?: (e: React.MouseEvent) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
};

const getSectionColor = (section?: string | null) => {
  if (section === "מיצוב") return {
    bg: "bg-blue-500",
    text: "text-blue-700",
    bgLight: "bg-blue-100",
    border: "border-blue-300",
  };
  if (section === "איתור") return {
    bg: "bg-green-500",
    text: "text-green-700",
    bgLight: "bg-green-100",
    border: "border-green-300",
  };
  return {
    bg: "bg-gray-400",
    text: "text-gray-700",
    bgLight: "bg-gray-100",
    border: "border-gray-300",
  };
};

export const TaskCard = ({
  task,
  onClick,
  onCollaboratorsClick,
  draggable = false,
  onDragStart,
}: TaskCardProps) => {
  const status = getStatusConfig(task.status || "pending");
  const priority = getPriorityConfig(task.priority || "medium");
  const sectionColors = getSectionColor(task.section);
  const isChildTask = !!task.parentTaskId;

  return (
    <div
      className={`group relative overflow-hidden rounded-lg border-2 transition-all cursor-pointer p-4 ${
        isChildTask
          ? `${status.stickyNoteBorder} ${status.stickyNoteColor} ${status.stickyNoteShadow} hover:shadow-xl hover:scale-[1.02] hover:rotate-1`
          : "border-gray-200 bg-white shadow-sm hover:shadow-md"
      }`}
      style={isChildTask ? {
        transform: 'rotate(-0.5deg)',
      } : {}}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
    >
      {/* Sticky note corner effect for child tasks */}
      {isChildTask && (
        <div className="absolute top-0 right-0 w-0 h-0 border-l-[25px] border-l-transparent border-t-[25px] border-t-black/15" />
      )}
      {/* Status color bar on right - thicker (only for child tasks) */}
      {isChildTask && (
        <div
          className={`absolute right-0 top-0 h-full w-3 ${status.color}`}
        />
      )}
      {/* Section color bar on left (if section exists) */}
      {task.section && !isChildTask && (
        <div
          className={`absolute left-0 top-0 h-full w-2 ${sectionColors.bg}`}
        />
      )}

      <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
        <span className={`rounded-md px-2 py-0.5 text-xs font-medium shadow-sm ${priority.color}`}>
          {priority.label}
        </span>
        {task.isGeneral && (
          <span className="rounded-md px-2 py-0.5 text-xs font-medium shadow-sm bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
            כללי
          </span>
        )}
      </div>

      <div className={`pr-3 ${isChildTask ? "relative z-10" : ""}`}>
        {task.parentTitle && (
          <div className="mb-2 flex items-center">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-md border-2 ${
              isChildTask 
                ? "bg-white/90 text-gray-800 border-gray-400 backdrop-blur-sm" 
                : "bg-gray-100 text-gray-700 border-gray-300"
            }`}>
              <Icons.chevronUp className="h-3.5 w-3.5 text-gray-600" />
              <span className="text-[10px] text-gray-500 font-medium">משימת אב:</span>
              <span className="font-bold text-gray-900">{task.parentTitle}</span>
            </span>
          </div>
        )}
        <h3 className={`mb-2 font-bold leading-tight ${isChildTask ? status.textColor : "text-gray-900"} ${isChildTask ? "drop-shadow-sm" : ""}`}>
          {task.title}
        </h3>

        {task.description && (
          <p className={`${isChildTask ? status.textColor : "text-muted-foreground"} ${isChildTask ? "opacity-90" : "opacity-80"} mb-3 line-clamp-2 text-sm`}>
            {task.description}
          </p>
        )}

        <div className="mb-3 flex flex-wrap gap-2 items-center">
          {task.section && !isChildTask && (
            <span className={`rounded-md px-2 py-0.5 text-xs font-bold text-white shadow-sm ${sectionColors.bg}`}>
              {task.section}
            </span>
          )}
          <span className={`rounded-md ${sectionColors.bgLight} ${sectionColors.text} px-2 py-0.5 text-xs font-medium border ${sectionColors.border}`}>
            {task.topic}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div
            className="relative flex items-center gap-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onCollaboratorsClick?.(e);
            }}
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
          <div className="flex items-center gap-2">
            {task.discussionCount != null && task.discussionCount > 0 && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium flex items-center gap-1 ${
                task.hasUnreadDiscussion
                  ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  : "bg-gray-100 text-gray-700"
              }`}>
                <Icons.messageCircle className="h-3 w-3" />
                {task.discussionCount}
                {task.hasUnreadDiscussion && (
                  <span className="text-[10px]">חדש</span>
                )}
              </span>
            )}
            {task.dueDate && (
              <span className={`${isChildTask ? status.textColor : "text-muted-foreground"} ${isChildTask ? "opacity-90" : "opacity-70"} text-xs font-semibold`}>
                <Icons.calendar className="inline h-3 w-3 mr-1" />
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
    </div>
  );
};
