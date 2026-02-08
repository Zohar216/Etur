"use client";

import { useState } from "react";
import { Avatar } from "@/components/avatar";
import { Icons } from "@/components/icons";
import { getPriorityConfig } from "@/lib/task-config";
import type { ParentTask } from "@/lib/task-types";
import type { Task } from "@/lib/task-types";
import { TaskCard } from "@/components/task-card";

type ParentTaskCardProps = {
  parentTask: ParentTask;
  onClick: () => void;
  childTasks?: Task[];
  childTasksCount?: number;
  onChildTaskClick?: (task: Task) => void;
  onChildCollaboratorsClick?: (task: Task, e: React.MouseEvent) => void;
};

const getSectionColor = (section: string) => {
  if (section === "מיצוב") return {
    bg: "bg-blue-500",
    text: "text-blue-700",
    bgLight: "bg-blue-100",
    border: "border-blue-300",
    gradientFrom: "from-blue-50",
    gradientTo: "to-blue-100",
  };
  if (section === "איתור") return {
    bg: "bg-green-500",
    text: "text-green-700",
    bgLight: "bg-green-100",
    border: "border-green-300",
    gradientFrom: "from-green-50",
    gradientTo: "to-green-100",
  };
  return {
    bg: "bg-gray-400",
    text: "text-gray-700",
    bgLight: "bg-gray-100",
    border: "border-gray-300",
    gradientFrom: "from-gray-50",
    gradientTo: "to-gray-100",
  };
};

export const ParentTaskCard = ({
  parentTask,
  onClick,
  childTasks = [],
  childTasksCount = 0,
  onChildTaskClick,
  onChildCollaboratorsClick,
}: ParentTaskCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const priority = getPriorityConfig(parentTask.priority || "medium");
  const sectionColors = getSectionColor(parentTask.section);
  const hasChildren = (childTasks?.length || 0) > 0 || childTasksCount > 0;

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.expand-button') || target.closest('.child-tasks-container')) {
      return;
    }
    onClick();
  };

  return (
    <div className="space-y-3">
      <div
        className={`group relative overflow-hidden rounded-xl border-2 ${sectionColors.border} bg-gradient-to-br ${sectionColors.gradientFrom} ${sectionColors.gradientTo} p-5 shadow-md transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer h-full flex flex-col`}
        onClick={handleCardClick}
      >
        <div
          className={`absolute left-0 top-0 h-full w-3 ${sectionColors.bg} shadow-sm`}
        />

        <div className="pr-3 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`rounded-lg px-2.5 py-1 text-xs font-bold shadow-sm ${sectionColors.bg} text-white whitespace-nowrap`}>
                  {parentTask.section}
                </span>
                <span className={`rounded-lg px-2.5 py-1 text-xs font-medium shadow-sm ${priority.color} whitespace-nowrap`}>
                  {priority.label}
                </span>
              </div>
              <h3 className={`text-xl font-bold leading-tight mb-2 ${sectionColors.text} break-words`}>
                {parentTask.title}
              </h3>
              <p className={`${sectionColors.text} opacity-75 text-sm font-medium line-clamp-2`}>
                {parentTask.topic}
              </p>
            </div>
            {parentTask.discussionCount != null && parentTask.discussionCount > 0 && (
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium flex items-center gap-1.5 flex-shrink-0 ml-2 ${
                parentTask.hasUnreadDiscussion
                  ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  : "bg-white/80 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              }`}>
                <Icons.messageCircle className="h-3.5 w-3.5" />
                {parentTask.discussionCount}
                {parentTask.hasUnreadDiscussion && (
                  <span className="text-[10px]">חדש</span>
                )}
              </span>
            )}
          </div>

          <div className="mt-auto pt-3 border-t border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar
                name={parentTask.createdBy_name}
                email={parentTask.createdBy_email}
                size="sm"
              />
              <span className="text-xs text-muted-foreground truncate">
                {parentTask.createdBy_name || parentTask.createdBy_email}
              </span>
            </div>
            {hasChildren && (
              <button
                onClick={handleToggleExpand}
                className="expand-button flex items-center gap-1.5 hover:bg-white/30 rounded-lg px-3 py-1.5 transition-colors bg-white/20 text-xs font-medium"
                title={isExpanded ? "סגור משימות" : "הראה משימות"}
              >
                <Icons.tasks className="h-3.5 w-3.5" />
                <span>{childTasksCount || childTasks?.length || 0} משימות</span>
                {isExpanded ? (
                  <Icons.chevronUp className="h-3.5 w-3.5" />
                ) : (
                  <Icons.chevronDown className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      {isExpanded && hasChildren && (
        <div className="child-tasks-container mt-2 ml-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
          {childTasks && childTasks.length > 0 ? (
            childTasks.map((childTask) => (
              <TaskCard
                key={childTask.id}
                task={childTask}
                onClick={() => onChildTaskClick?.(childTask)}
                onCollaboratorsClick={onChildCollaboratorsClick ? (e) => onChildCollaboratorsClick(childTask, e) : undefined}
              />
            ))
          ) : (
            <p className="text-xs text-muted-foreground pl-4">אין משימות בנים</p>
          )}
        </div>
      )}
    </div>
  );
};
