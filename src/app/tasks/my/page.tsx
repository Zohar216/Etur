"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";

import { KanbanBoard } from "@/components/kanban-board";
import { TaskDetailsPopup } from "@/components/task-details-popup";
import { CollaboratorsPopup } from "@/components/collaborators-popup";
import { SearchAndFilters } from "@/components/search-and-filters";
import { PinnedTasksSidebar } from "@/components/pinned-tasks-sidebar";
import type { Task } from "@/lib/task-types";

export default function MyTasksPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedTaskForCollaborators, setSelectedTaskForCollaborators] = useState<{
    task: Task;
    position: { top: number; left: number };
  } | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [pinnedTasks, setPinnedTasks] = useState<Set<string>>(new Set());
  const [pinnedTasksTab, setPinnedTasksTab] = useState<"active" | "completed">("active");

  useEffect(() => {
    if (!session?.user?.id) return;
    
    const fetchPinnedTasks = async () => {
      try {
        const response = await fetch("/api/pinned-tasks");
        if (response.ok) {
          const data = await response.json();
          setPinnedTasks(new Set(data.taskIds || []));
        }
      } catch (err) {
        console.error("Failed to load pinned tasks:", err);
      }
    };

    fetchPinnedTasks();
  }, [session]);

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    const fetchTasks = async () => {
      try {
        const cacheKey = `tasks-my-${session.user.id}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          const now = Date.now();
          if (now - parsed.timestamp < 10000) {
            setTasks(parsed.data.tasks || []);
            setLoading(false);
            return;
          }
        }

        const response = await fetch("/api/tasks/my", {
          next: { revalidate: 10 },
        });
        if (response.ok) {
          const data = await response.json();
          setTasks(data.tasks || []);
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({ data, timestamp: Date.now() }),
          );
        }
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [session]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        sessionStorage.removeItem(`tasks-my-${session?.user?.id}`);
        sessionStorage.removeItem("tasks");
        const refreshResponse = await fetch("/api/tasks/my", {
          next: { revalidate: 10 },
        });
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setTasks(data.tasks || []);
          sessionStorage.setItem(
            `tasks-my-${session?.user?.id}`,
            JSON.stringify({ data, timestamp: Date.now() }),
          );
        }
      }
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  const { domains, topics } = useMemo(() => {
    const domainSet = new Set<string>();
    const topicSet = new Set<string>();
    tasks.forEach((task) => {
      domainSet.add(task.domain);
      topicSet.add(task.topic);
    });
    return {
      domains: Array.from(domainSet).sort(),
      topics: Array.from(topicSet).sort(),
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        searchQuery === "" ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.topic.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDomain =
        selectedDomain === "all" || task.domain === selectedDomain;
      const matchesTopic =
        selectedTopic === "all" || task.topic === selectedTopic;

      return matchesSearch && matchesDomain && matchesTopic;
    });
  }, [tasks, searchQuery, selectedDomain, selectedTopic]);

  const handleCollaboratorsClick = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.collaborators && task.collaborators.length > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      setSelectedTaskForCollaborators({
        task,
        position: {
          top: rect.bottom + 8,
          left: rect.left,
        },
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId && session?.user?.id) {
      try {
        const response = await fetch("/api/pinned-tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ taskId }),
        });

        if (response.ok) {
          setPinnedTasks((prev) => new Set([...prev, taskId]));
        }
      } catch (err) {
        console.error("Failed to add pinned task:", err);
      }
    }
  };

  const handleRemovePinned = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (session?.user?.id) {
      try {
        const response = await fetch(`/api/pinned-tasks?taskId=${taskId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setPinnedTasks((prev) => {
            const newSet = new Set(prev);
            newSet.delete(taskId);
            return newSet;
          });
        }
      } catch (err) {
        console.error("Failed to remove pinned task:", err);
      }
    }
  };

  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <div className="rounded-lg border p-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">נדרשת התחברות</h1>
          <p className="text-muted-foreground mb-6">
            עליך להתחבר כדי לצפות במשימות שלך
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-muted-foreground">טוען משימות...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">משימות שלי</h1>
        </div>

        <SearchAndFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedDomain={selectedDomain}
          onDomainChange={setSelectedDomain}
          selectedTopic={selectedTopic}
          onTopicChange={setSelectedTopic}
          domains={domains}
          topics={topics}
        />
      </div>

      <div className="flex gap-6">
        <div className="flex-shrink-0" style={{ width: "520px" }}>
          <PinnedTasksSidebar
            pinnedTasks={pinnedTasks}
            allTasks={filteredTasks}
            activeTab={pinnedTasksTab}
            onTabChange={setPinnedTasksTab}
            onTaskClick={setSelectedTask}
            onRemovePinned={handleRemovePinned}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        </div>

        <div className="flex-1">
          <KanbanBoard
            tasks={filteredTasks}
            onTaskClick={setSelectedTask}
            onCollaboratorsClick={handleCollaboratorsClick}
            onDragStart={handleDragStart}
            showCreateButton={false}
          />
        </div>
      </div>

      {selectedTaskForCollaborators && (
        <CollaboratorsPopup
          task={selectedTaskForCollaborators.task}
          position={selectedTaskForCollaborators.position}
          onClose={() => setSelectedTaskForCollaborators(null)}
        />
      )}

      {selectedTask && (
        <TaskDetailsPopup
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onCollaboratorsClick={handleCollaboratorsClick}
        />
      )}
    </div>
  );
}
