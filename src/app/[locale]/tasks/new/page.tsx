"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type User = {
  id: string;
  name: string | null;
  email: string;
};

export default function NewTaskPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    domain: "",
    topic: "",
    leaderId: session?.user?.id || "",
    dueDate: "",
    priority: "medium",
    collaboratorIds: [] as string[],
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

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
        setError(data.error || "Something went wrong");
        return;
      }

      router.push("/tasks");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">יצירת משימה חדשה</h1>
        <Link href="/tasks">
          <Button variant="outline">חזרה לרשימת משימות</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border p-6">
        <div className="space-y-2">
          <Label htmlFor="title">כותרת המשימה *</Label>
          <Input
            id="title"
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
          <Label htmlFor="description">תיאור</Label>
          <textarea
            id="description"
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
            <Label htmlFor="domain">תחום *</Label>
            <Input
              id="domain"
              type="text"
              placeholder="לדוגמה: פיתוח, שיווק, תמיכה"
              value={formData.domain}
              onChange={(e) =>
                setFormData({ ...formData, domain: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">נושא *</Label>
            <Input
              id="topic"
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
          <Label htmlFor="leaderId">מוביל המשימה *</Label>
          <Select
            id="leaderId"
            value={formData.leaderId}
            onChange={(e) =>
              setFormData({ ...formData, leaderId: e.target.value })
            }
            required
          >
            <option value="">בחר מוביל</option>
            {users.length === 0 ? (
              <option value="" disabled>
                טוען משתמשים...
              </option>
            ) : (
              users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email}
                  {user.email ? ` (${user.email})` : ""}
                </option>
              ))
            )}
          </Select>
          {users.length > 0 && (
            <p className="text-muted-foreground text-xs">
              {users.length} משתמשים זמינים
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">תאריך יעד (אופציונלי)</Label>
          <Input
            id="dueDate"
            type="datetime-local"
            value={formData.dueDate}
            onChange={(e) =>
              setFormData({ ...formData, dueDate: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">רמת דחיפות *</Label>
          <Select
            id="priority"
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
          <Label>שותפים למשימה</Label>
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

        {error && <div className="text-destructive text-sm">{error}</div>}

        <div className="flex gap-4">
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? "יוצר משימה..." : "צור משימה"}
          </Button>
          <Link href="/tasks" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              ביטול
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
