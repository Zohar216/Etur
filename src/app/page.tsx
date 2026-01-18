"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { KanbanBoard } from "@/components/kanban-board";
import { TaskDetailsPopup } from "@/components/task-details-popup";
import { CollaboratorsPopup } from "@/components/collaborators-popup";
import { SearchAndFilters } from "@/components/search-and-filters";
import { PinnedTasksSidebar } from "@/components/pinned-tasks-sidebar";
import type { Task } from "@/lib/task-types";
import { getPriorityConfig, getStatusColor, statusConfig } from "@/lib/task-config";

export default function HomePage() {
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
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
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
  const [selectedDomainForTask, setSelectedDomainForTask] = useState<string>("");
  const [users, setUsers] = useState<Array<{ id: string; name: string | null; email: string }>>([]);
  const [domainsList, setDomainsList] = useState<Array<{ id: string; name: string }>>([]);
  const [createTaskLoading, setCreateTaskLoading] = useState(false);
  const [createTaskError, setCreateTaskError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    domain: "",
    topic: "",
    leaderId: "",
    dueDate: "",
    priority: "medium",
    collaboratorIds: [] as string[],
  });

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

    const fetchTasks = async () => {
      try {
        const cacheKey = "tasks";
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

        const response = await fetch("/api/tasks", {
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

    const handleTasksUpdated = () => {
      sessionStorage.removeItem("tasks");
      fetchTasks();
    };

    window.addEventListener("tasks-updated", handleTasksUpdated);

    return () => {
      window.removeEventListener("tasks-updated", handleTasksUpdated);
    };
  }, [session]);

  useEffect(() => {
    if (!isCreateTaskOpen) return;

    const fetchUsers = async () => {
      try {
        const cacheKey = "users";
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          const now = Date.now();
          if (now - parsed.timestamp < 300000) {
            setUsers(parsed.data.users || []);
            return;
          }
        }

        const response = await fetch("/api/users");
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({ data, timestamp: Date.now() }),
          );
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    const fetchDomains = async () => {
      try {
        const cacheKey = "domains";
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          const now = Date.now();
          if (now - parsed.timestamp < 300000) {
            setDomainsList(parsed.data.domains || []);
            return;
          }
        }

        const response = await fetch("/api/domains", {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          setDomainsList(data.domains || []);
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({ data, timestamp: Date.now() }),
          );
        }
      } catch (err) {
        console.error("Failed to fetch domains:", err);
      }
    };

    fetchUsers();
    fetchDomains();
  }, [isCreateTaskOpen]);

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
        sessionStorage.removeItem("tasks");
        const refreshResponse = await fetch("/api/tasks", {
          next: { revalidate: 10 },
        });
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setTasks(data.tasks || []);
          sessionStorage.setItem(
            "tasks",
            JSON.stringify({ data, timestamp: Date.now() }),
          );
        }
      }
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

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

  // Get unique domains and topics for filters
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

  // Filter tasks
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

  const handleOpenCreateTask = (domain?: string) => {
    setSelectedDomainForTask(domain || "");
    setFormData({
      title: "",
      description: "",
      domain: domain || "",
      topic: "",
      leaderId: session?.user?.id || "",
      dueDate: "",
      priority: "medium",
      collaboratorIds: [],
    });
    setIsCreateTaskOpen(true);
  };

  const handleCloseCreateTask = () => {
    setIsCreateTaskOpen(false);
    setSelectedDomainForTask("");
    setCreateTaskError("");
    setFormData({
      title: "",
      description: "",
      domain: "",
      topic: "",
      leaderId: session?.user?.id || "",
      dueDate: "",
      priority: "medium",
      collaboratorIds: [],
    });
  };

  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateTaskError("");
    setCreateTaskLoading(true);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          dueDate: formData.dueDate || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCreateTaskError(data.error || "משהו השתבש");
        return;
      }

      sessionStorage.removeItem("tasks");
      sessionStorage.removeItem("my-tasks");
      handleCloseCreateTask();
      
      const refreshResponse = await fetch("/api/tasks", {
        next: { revalidate: 10 },
      });
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setTasks(refreshData.tasks || []);
        sessionStorage.setItem(
          "tasks",
          JSON.stringify({ data: refreshData, timestamp: Date.now() }),
        );
      }
    } catch {
      setCreateTaskError("משהו השתבש. נסה שוב.");
    } finally {
      setCreateTaskLoading(false);
    }
  };

  const handleCollaboratorToggle = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      collaboratorIds: prev.collaboratorIds.includes(userId)
        ? prev.collaboratorIds.filter((id) => id !== userId)
        : [...prev.collaboratorIds, userId],
    }));
  };

  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <div className="rounded-lg border p-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">ברוך הבא</h1>
          <p className="text-muted-foreground mb-6">
            עליך להתחבר כדי לצפות בלוח המשימות
          </p>
          <Link href="/login">
            <Button>התחבר</Button>
          </Link>
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
      {/* Header with Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">לוח משימות</h1>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleOpenCreateTask()}>
              <Icons.plus className="ml-2 h-4 w-4" />
              משימה חדשה
            </Button>
          </div>
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

      {/* Main Layout with Sidebar and Kanban */}
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
          {filteredTasks.length === 0 ? (
            <div className="rounded-lg border bg-card p-12 text-center">
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedDomain !== "all" || selectedTopic !== "all"
                  ? "לא נמצאו משימות התואמות לחיפוש"
                  : "אין משימות עדיין"}
              </p>
              {(!searchQuery && selectedDomain === "all" && selectedTopic === "all") && (
                <Button onClick={() => handleOpenCreateTask()}>
                  צור משימה ראשונה
                </Button>
              )}
            </div>
          ) : (
            <KanbanBoard
              tasks={filteredTasks}
              onTaskClick={setSelectedTask}
              onCollaboratorsClick={handleCollaboratorsClick}
              onCreateTask={handleOpenCreateTask}
              onDragStart={handleDragStart}
              showCreateButton={true}
            />
          )}
        </div>
      </div>

      {selectedTaskForCollaborators && (
        <CollaboratorsPopup
          task={selectedTaskForCollaborators.task}
          position={selectedTaskForCollaborators.position}
          onClose={() => setSelectedTaskForCollaborators(null)}
          onCollaboratorAdded={(collaborator) => {
            const collaboratorWithRole = {
              ...collaborator,
              role: collaborator.role || "collaborator",
            };
            setTasks((prevTasks) =>
              prevTasks.map((t) =>
                t.id === selectedTaskForCollaborators.task.id
                  ? {
                      ...t,
                      collaborators: [
                        ...(t.collaborators || []),
                        collaborator,
                      ],
                    }
                  : t
              )
            );
            if (selectedTask && selectedTask.id === selectedTaskForCollaborators.task.id) {
              setSelectedTask({
                ...selectedTask,
                collaborators: [
                  ...(selectedTask.collaborators || []),
                  collaborator,
                ],
              });
            }
            setSelectedTaskForCollaborators({
              ...selectedTaskForCollaborators,
              task: {
                ...selectedTaskForCollaborators.task,
                collaborators: [
                  ...(selectedTaskForCollaborators.task.collaborators || []),
                  collaborator,
                ],
              },
            });
          }}
          onCollaboratorRemoved={(userId) => {
            setTasks((prevTasks) =>
              prevTasks.map((t) =>
                t.id === selectedTaskForCollaborators.task.id
                  ? {
                      ...t,
                      collaborators: (t.collaborators || []).filter(
                        (c) => c.id !== userId
                      ),
                    }
                  : t
              )
            );
            if (selectedTask && selectedTask.id === selectedTaskForCollaborators.task.id) {
              setSelectedTask({
                ...selectedTask,
                collaborators: (selectedTask.collaborators || []).filter(
                  (c) => c.id !== userId
                ),
              });
            }
            setSelectedTaskForCollaborators({
              ...selectedTaskForCollaborators,
              task: {
                ...selectedTaskForCollaborators.task,
                collaborators: (selectedTaskForCollaborators.task.collaborators || []).filter(
                  (c) => c.id !== userId
                ),
              },
            });
          }}
        />
      )}

      {selectedTask && (
        <TaskDetailsPopup
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onCollaboratorsClick={handleCollaboratorsClick}
        />
      )}

      {/* Create Task Popup */}
      {isCreateTaskOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={handleCloseCreateTask}
        >
          <div
            className="relative rounded-xl border border-border bg-background p-6 shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">יצירת משימה חדשה</h2>
              <button
                onClick={handleCloseCreateTask}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="סגור"
              >
                <Icons.x className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="create-title" className="text-sm font-medium">
                  כותרת המשימה *
                </label>
                <Input
                  id="create-title"
                  type="text"
                  placeholder="הכנס כותרת למשימה"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="create-description" className="text-sm font-medium">
                  תיאור
                </label>
                <textarea
                  id="create-description"
                  className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[100px] w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [dir=ltr]:text-left [dir=rtl]:text-right"
                  placeholder="הכנס תיאור מפורט של המשימה"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="create-domain" className="text-sm font-medium">
                    תחום *
                  </label>
                  <Select
                    id="create-domain"
                    value={formData.domain}
                    onChange={(e) =>
                      setFormData({ ...formData, domain: e.target.value })
                    }
                    required
                  >
                    <option value="">בחר תחום</option>
                    {domainsList.map((domain) => (
                      <option key={domain.id} value={domain.name}>
                        {domain.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="create-topic" className="text-sm font-medium">
                    נושא *
                  </label>
                  <Input
                    id="create-topic"
                    type="text"
                    placeholder="הכנס נושא ספציפי"
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="create-leader" className="text-sm font-medium">
                  מוביל המשימה *
                </label>
                <Select
                  id="create-leader"
                  value={formData.leaderId}
                  onChange={(e) =>
                    setFormData({ ...formData, leaderId: e.target.value })
                  }
                  required
                >
                  <option value="">בחר מוביל</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email}
                      {user.email ? ` (${user.email})` : ""}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="create-dueDate" className="text-sm font-medium">
                  תאריך יעד (אופציונלי)
                </label>
                <Input
                  id="create-dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="create-priority" className="text-sm font-medium">
                  רמת דחיפות *
                </label>
                <Select
                  id="create-priority"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  required
                >
                  <option value="low">נמוכה</option>
                  <option value="medium">בינונית</option>
                  <option value="high">גבוהה</option>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">שותפים למשימה</label>
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-4">
                  {users.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      אין משתמשים זמינים
                    </p>
                  ) : (
                    users.map((user) => (
                      <label
                        key={user.id}
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <input
                          type="checkbox"
                          checked={formData.collaboratorIds.includes(user.id)}
                          onChange={() => handleCollaboratorToggle(user.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <span className="text-sm">{user.name || user.email}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {createTaskError && (
                <div className="text-destructive text-sm">{createTaskError}</div>
              )}

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={createTaskLoading}>
                  {createTaskLoading ? "יוצר משימה..." : "צור משימה"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleCloseCreateTask}
                >
                  ביטול
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
