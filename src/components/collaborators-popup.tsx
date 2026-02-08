"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/avatar";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { Task } from "@/lib/task-types";

type CollaboratorsPopupProps = {
  task: Task;
  position: { top: number; left: number };
  onClose: () => void;
  onCollaboratorAdded?: (collaborator: { id: string; name: string | null; email: string; role: string }) => void;
  onCollaboratorRemoved?: (userId: string) => void;
};

type User = {
  id: string;
  name: string | null;
  email: string;
};

export const CollaboratorsPopup = ({
  task,
  position,
  onClose,
  onCollaboratorAdded,
  onCollaboratorRemoved,
}: CollaboratorsPopupProps) => {
  const { data: session } = useSession();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingUserId, setAddingUserId] = useState<string | null>(null);
  const userRole = (session?.user as any)?.role || "חפ״ש";
  const canEdit = userRole === "מפקד צוות" || userRole === "מנהל";

  useEffect(() => {
    if (showAddMenu) {
      const fetchUsers = async () => {
        try {
          const response = await fetch("/api/users");
          if (response.ok) {
            const data = await response.json();
            const existingCollaboratorIds = new Set(
              task.collaborators?.map((c) => c.id) || []
            );
            const filteredUsers = data.users.filter(
              (user: User) => !existingCollaboratorIds.has(user.id) && user.id !== task.leaderId
            );
            setUsers(filteredUsers);
          }
        } catch (err) {
          console.error("Failed to fetch users:", err);
        }
      };
      fetchUsers();
    }
  }, [showAddMenu, task.collaborators, task.leaderId]);

  const handleAddCollaborator = async (userId: string) => {
    setAddingUserId(userId);
    try {
      const response = await fetch(`/api/tasks/${task.id}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.collaborator) {
          setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
          if (onCollaboratorAdded) {
            onCollaboratorAdded({
              ...data.collaborator,
              role: data.collaborator.role || "collaborator",
            });
          }
        }
        setShowAddMenu(false);
        window.dispatchEvent(new CustomEvent("tasks-updated"));
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to add collaborator:", errorData);
        alert("שגיאה בהוספת משתתף: " + (errorData.error || "שגיאה לא ידועה"));
      }
    } catch (err) {
      console.error("Failed to add collaborator:", err);
      alert("שגיאה בהוספת משתתף");
    } finally {
      setAddingUserId(null);
    }
  };

  const handleRemoveCollaborator = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("האם אתה בטוח שברצונך להסיר משתתף זה?")) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${task.id}/collaborators?userId=${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        if (onCollaboratorRemoved) {
          onCollaboratorRemoved(userId);
        }
        window.dispatchEvent(new CustomEvent("tasks-updated"));
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to remove collaborator:", errorData);
        alert("שגיאה בהסרת משתתף: " + (errorData.error || "שגיאה לא ידועה"));
      }
    } catch (err) {
      console.error("Failed to remove collaborator:", err);
      alert("שגיאה בהסרת משתתף");
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[60]"
        onClick={onClose}
      />
      <div
        className="fixed z-[70]"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <div
          className="relative rounded-lg border bg-white p-3 shadow-lg w-56 dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold">משתתפים</h3>
            <div className="flex items-center gap-1">
              {canEdit && (
                <button
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="הוסף משתתף"
                >
                  <Icons.plus className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="סגור"
              >
                <Icons.x className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          {showAddMenu && (
            <div className="mb-2 p-2 border rounded bg-gray-50 dark:bg-gray-900 max-h-32 overflow-y-auto">
              {users.length > 0 ? (
                <div className="space-y-1">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleAddCollaborator(user.id)}
                      disabled={addingUserId === user.id}
                      className="w-full flex items-center gap-2 rounded p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-right disabled:opacity-50"
                    >
                      <Avatar
                        name={user.name}
                        email={user.email}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs truncate">
                          {user.name || user.email}
                        </p>
                        {user.name && (
                          <p className="text-muted-foreground text-[10px] truncate">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-xs text-center py-1">
                  אין משתמשים זמינים
                </p>
              )}
            </div>
          )}
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {task.collaborators && task.collaborators.length > 0 ? (
              task.collaborators.map((collab) => (
                <div
                  key={collab.id}
                  className="flex items-center gap-2 rounded-md p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                >
                  <Avatar
                    name={collab.name}
                    email={collab.email}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs truncate">
                      {collab.name || collab.email}
                    </p>
                    {collab.name && (
                      <p className="text-muted-foreground text-[10px] truncate">
                        {collab.email}
                      </p>
                    )}
                  </div>
                  {canEdit && (
                    <button
                      onClick={(e) => handleRemoveCollaborator(collab.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-0.5 rounded hover:bg-destructive/10"
                      aria-label="הסר משתתף"
                    >
                      <Icons.x className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-xs text-center py-2">
                אין שותפים
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
