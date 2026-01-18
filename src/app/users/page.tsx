"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

type User = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  isActive: boolean;
  role: string;
};

export default function UsersPage() {
  const { data: session, update } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const cacheKey = "users";
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          const now = Date.now();
          if (now - parsed.timestamp < 300000) {
            setUsers(parsed.data.users || []);
            setLoading(false);
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
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchUsers();
      setCurrentUserRole((session.user as any)?.role || "חפ״ש");
    }
  }, [session]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingRole(userId);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "משהו השתבש");
        return;
      }

      sessionStorage.removeItem("users");
      const refreshResponse = await fetch("/api/users");
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setUsers(refreshData.users || []);
        sessionStorage.setItem(
          "users",
          JSON.stringify({ data: refreshData, timestamp: Date.now() }),
        );
      }

      if (userId === session?.user?.id) {
        await update();
        setCurrentUserRole(newRole);
      }
    } catch (err) {
      console.error("Failed to update user role:", err);
      alert("משהו השתבש. נסה שוב.");
    } finally {
      setUpdatingRole(null);
    }
  };

  const isManager = currentUserRole === "מנהל";

  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <div className="rounded-lg border p-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">נדרשת התחברות</h1>
          <p className="text-muted-foreground mb-6">
            עליך להתחבר כדי לצפות במשתמשים
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-muted-foreground">טוען משתמשים...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">ניהול משתמשים</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          רשימת כל המשתמשים במערכת
        </p>
      </div>

      {users.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">אין משתמשים במערכת</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-6 py-3 text-right text-sm font-semibold">
                    משתמש
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">
                    אימייל
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">
                    תפקיד
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">
                    סטטוס
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={user.name}
                          email={user.email}
                          image={user.image}
                          size="md"
                        />
                        <div>
                          <p className="font-medium">
                            {user.name || "ללא שם"}
                          </p>
                          {user.name && (
                            <p className="text-muted-foreground text-sm">
                              {user.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm">{user.email}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isManager ? (
                        <Select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={updatingRole === user.id}
                          className="min-w-[100px]"
                        >
                          <option value="חפ״ש">חפ״ש</option>
                          <option value="מנהל">מנהל</option>
                        </Select>
                      ) : (
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.role === "מנהל"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          }`}
                        >
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                        }`}
                      >
                        {user.isActive ? "פעיל" : "לא פעיל"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-muted-foreground">
        סה"כ {users.length} משתמש{users.length !== 1 ? "ים" : ""}
      </div>
    </div>
  );
}
