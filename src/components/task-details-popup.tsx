"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { Icons } from "@/components/icons";
import { getPriorityConfig, statusConfig } from "@/lib/task-config";
import type { Task } from "@/lib/task-types";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user_id: string;
  user_name: string | null;
  user_email: string;
};

type TaskDetailsPopupProps = {
  task: Task;
  onClose: () => void;
  onCollaboratorsClick?: (task: Task, e: React.MouseEvent) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, newStatus: string) => void;
};

export const TaskDetailsPopup = ({
  task,
  onClose,
  onCollaboratorsClick,
  onDelete,
  onStatusChange,
}: TaskDetailsPopupProps) => {
  const { data: session } = useSession();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(task.status || "pending");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const status = statusConfig[currentStatus as keyof typeof statusConfig] || statusConfig.pending;
  const priority = getPriorityConfig(task.priority || "medium");

  useEffect(() => {
    if (task.id && !isUpdatingStatus) {
      setCurrentStatus(task.status || "pending");
    }
  }, [task.id, task.status, isUpdatingStatus]);

  const canChangeStatus = () => {
    if (!session?.user) return false;
    if ((task as any).isParentTask) return false;
    const userRole = (session.user as any)?.role || "חפ״ש";
    const userId = session.user.id;
    
    if (userRole === "מפקד צוות" || userRole === "מנהל") return true;
    if (task.leaderId === userId) return true;
    if (task.collaborators?.some(c => c.id === userId)) return true;
    return false;
  };

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoadingComments(true);
      try {
        const response = await fetch(`/api/tasks/${task.id}/comments`);
        if (response.ok) {
          const data = await response.json();
          setComments(data.comments || []);
          window.dispatchEvent(new CustomEvent("tasks-updated"));
          setTimeout(() => {
            commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      } catch (err) {
        console.error("Failed to fetch comments:", err);
      } finally {
        setIsLoadingComments(false);
      }
    };

    if (task.id) {
      fetchComments();
    }
  }, [task.id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !session?.user) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.comment) {
          setComments((prev) => [...prev, data.comment]);
          setNewComment("");
          window.dispatchEvent(new CustomEvent("tasks-updated"));
          setTimeout(() => {
            commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        } else {
          console.error("Comment was not returned from server");
          const refreshResponse = await fetch(`/api/tasks/${task.id}/comments`);
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            setComments(refreshData.comments || []);
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to add comment:", errorData.error || "Unknown error");
        alert(errorData.error || "שגיאה בשמירת התגובה. נסה שוב.");
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert("שגיאה בשמירת התגובה. נסה שוב.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if ((task as any).isParentTask) {
      alert("לא ניתן לשנות סטטוס למשימת אב");
      return;
    }
    if (newStatus === currentStatus || isUpdatingStatus) return;
    
    const previousStatus = currentStatus;
    setCurrentStatus(newStatus);
    
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        onStatusChange?.(task.id, newStatus);
      } else {
        const data = await response.json();
        console.error("Failed to update status:", data.error);
        setCurrentStatus(previousStatus);
        alert(data.error || "שגיאה בעדכון הסטטוס");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      setCurrentStatus(previousStatus);
      alert("שגיאה בעדכון הסטטוס");
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    setShowDeleteConfirm(false);
    onClose();
    
    try {
      await onDelete(task.id);
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert("שגיאה במחיקת המשימה. נסה שוב.");
    } finally {
      setIsDeleting(false);
    }
  };

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
              {canChangeStatus() ? (
                <Select
                  value={currentStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={isUpdatingStatus}
                  className={`w-40 font-bold ${status.color} text-white border-0`}
                >
                  <option value="pending">משימה פתוחה</option>
                  <option value="in-progress">בטיפול</option>
                  <option value="completed">בוצע</option>
                </Select>
              ) : (
                <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium mt-1 ${status.color}`}>
                  {status.label}
                </span>
              )}
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

                {/* Discussion Section */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                    <Icons.messageCircle className="h-4 w-4" />
                    שיח ({comments.length})
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {isLoadingComments ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="rounded-lg border border-border bg-slate-50/50 dark:bg-slate-900/50 p-3 animate-pulse">
                            <div className="flex items-start gap-2 mb-2">
                              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0" />
                              <div className="flex-1 min-w-0 space-y-2">
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-32" />
                              </div>
                            </div>
                            <div className="space-y-2 mt-3">
                              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
                              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : comments.length === 0 ? (
                      <p className="text-muted-foreground text-sm">אין תגובות עדיין</p>
                    ) : (
                      <>
                        {comments.map((comment) => (
                          <div key={comment.id} className="rounded-lg border border-border bg-slate-50/50 dark:bg-slate-900/50 p-3">
                            <div className="flex items-start gap-2 mb-2">
                              <Avatar
                                name={comment.user_name}
                                email={comment.user_email}
                                size="sm"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">
                                  {comment.user_name || comment.user_email}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-foreground whitespace-pre-wrap mb-2">
                              {comment.content}
                            </p>
                            <div className="flex justify-end">
                              <p className="text-muted-foreground text-xs text-left">
                                {new Date(comment.createdAt).toLocaleString("he-IL", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={commentsEndRef} />
                      </>
                    )}
                  </div>

                  {/* Add comment form */}
                  {session?.user && (
                    <form onSubmit={handleAddComment} className="mt-4">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="הוסף תגובה..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="flex-1"
                          disabled={isSubmittingComment}
                        />
                        <Button
                          type="submit"
                          size="sm"
                          disabled={!newComment.trim() || isSubmittingComment}
                        >
                          {isSubmittingComment ? "שולח..." : "שלח"}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6 bg-slate-50/30 dark:bg-slate-900/30">
              <div className="flex items-start gap-3">
                <Icons.user className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">מוביל המשימה</p>
                  {task.leader_email ? (
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
                  ) : (
                    <p className="text-muted-foreground text-sm">לא הוגדר מוביל</p>
                  )}
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

              <div className="flex items-start gap-3">
                <Icons.calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">תאריך יעד</p>
                  {task.dueDate ? (
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
                  ) : (
                    <p className="text-muted-foreground text-sm">לא הוגדר תאריך יעד</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Icons.signal className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">דחיפות</p>
                  <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${priority.color}`}>
                    {priority.label}
                  </span>
                </div>
              </div>

              {canChangeStatus() && !(task as any).isParentTask && (
                <div className="flex items-start gap-3">
                  <Icons.tasks className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">סטטוס</p>
                    <Select
                      value={currentStatus}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={isUpdatingStatus}
                      className="w-full"
                    >
                      <option value="pending">משימה פתוחה</option>
                      <option value="in-progress">בטיפול</option>
                      <option value="completed">בוצע</option>
                    </Select>
                    {isUpdatingStatus && (
                      <p className="text-xs text-muted-foreground mt-1">מעדכן...</p>
                    )}
                  </div>
                </div>
              )}
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
            {onDelete && ((session?.user as any)?.role === "מפקד צוות" || (session?.user as any)?.role === "מנהל") && (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
              >
                <Icons.trash className="h-4 w-4" />
                מחק משימה
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onClose}
            >
              סגור
            </Button>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="מחיקת משימה"
        message={`האם אתה בטוח שברצונך למחוק את המשימה "${task.title}"? פעולה זו לא ניתנת לביטול.`}
        confirmText="מחק"
        cancelText="ביטול"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};
