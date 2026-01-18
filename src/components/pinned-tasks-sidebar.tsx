"use client";

import { Avatar } from "@/components/avatar";
import { Icons } from "@/components/icons";
import { getPriorityConfig, getStatusColor } from "@/lib/task-config";
import type { Task } from "@/lib/task-types";

type PinnedTasksSidebarProps = {
  pinnedTasks: Set<string>;
  allTasks: Task[];
  activeTab: "active" | "completed";
  onTabChange: (tab: "active" | "completed") => void;
  onTaskClick: (task: Task) => void;
  onRemovePinned: (taskId: string, e: React.MouseEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
};

export const PinnedTasksSidebar = ({
  pinnedTasks,
  allTasks,
  activeTab,
  onTabChange,
  onTaskClick,
  onRemovePinned,
  onDragOver,
  onDrop,
}: PinnedTasksSidebarProps) => {
  const pinnedTasksList = allTasks.filter((task) => pinnedTasks.has(task.id));
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sortedPinnedTasks = pinnedTasksList.sort((a, b) => {
    const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] ?? priorityOrder.medium;
    const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] ?? priorityOrder.medium;
    return priorityA - priorityB;
  });

  const activePinnedTasks = sortedPinnedTasks.filter((task) => task.status !== "completed");
  const completedPinnedTasks = sortedPinnedTasks.filter((task) => task.status === "completed");
  const displayedPinnedTasks = activeTab === "active" ? activePinnedTasks : completedPinnedTasks;

  return (
    <div className="rounded-lg border bg-white shadow-sm h-full flex flex-col">
      <div className="border-b bg-gray-50 p-4">
        <h2 className="text-lg font-bold">משימות לשבוע הקרוב</h2>
        <p className="text-muted-foreground text-xs mt-1">
          גרור משימות לכאן כדי לסמן אותן במשימות לשבוע הקרוב
        </p>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => onTabChange("active")}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "active"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          פעילות ({activePinnedTasks.length})
        </button>
        <button
          onClick={() => onTabChange("completed")}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "completed"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          בוצעו ({completedPinnedTasks.length})
        </button>
      </div>

      <div
        className="flex-1 p-4 space-y-3 overflow-y-auto min-h-[200px]"
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {displayedPinnedTasks.length === 0 ? (
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-muted-foreground text-sm text-center">
              {activeTab === "active" 
                ? "גרור משימות לכאן"
                : "אין משימות שבוצעו"}
            </p>
          </div>
        ) : (
          displayedPinnedTasks.map((task) => {
            const statusColor = getStatusColor(task.status || "pending");
            const priority = getPriorityConfig(task.priority || "medium");
            return (
              <div
                key={task.id}
                className="group relative rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md cursor-pointer"
                onClick={() => onTaskClick(task)}
              >
                <button
                  onClick={(e) => onRemovePinned(task.id, e)}
                  className="absolute left-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                  aria-label="הסר מסומן"
                >
                  <Icons.x className="h-4 w-4" />
                </button>
                <div className="mb-2 pr-6">
                  <h3 className="font-semibold text-sm leading-tight mb-1">
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-muted-foreground line-clamp-1 text-xs">
                      {task.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${priority.color}`}>
                    {priority.label}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {task.domain}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {task.collaborators && task.collaborators.length > 0 && (
                      <>
                        {task.collaborators.slice(0, 3).map((collab, index) => (
                          <div
                            key={collab.id}
                            className="relative"
                            style={{ marginRight: index > 0 ? "-8px" : "0" }}
                          >
                            <Avatar
                              name={collab.name}
                              email={collab.email}
                              size="sm"
                              className="border-2 border-white"
                            />
                          </div>
                        ))}
                        {task.collaborators.length > 3 && (
                          <span className="text-muted-foreground text-xs">
                            +{task.collaborators.length - 3}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {task.dueDate && (
                      <span className="text-muted-foreground text-xs">
                        {new Date(task.dueDate).toLocaleDateString("he-IL", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                    <div
                      className={`w-2 h-2 rounded-full ${statusColor}`}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
