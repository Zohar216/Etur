"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Domain = {
  id: string;
  name: string;
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingDomains, setLoadingDomains] = useState(true);
  const [deletingDomain, setDeletingDomain] = useState<string | null>(null);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const cacheKey = "domains";
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          const now = Date.now();
          if (now - parsed.timestamp < 300000) {
            setDomains(parsed.data.domains || []);
            setLoadingDomains(false);
            return;
          }
        }

        const response = await fetch("/api/domains");
        if (response.ok) {
          const data = await response.json();
          setDomains(data.domains || []);
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({ data, timestamp: Date.now() }),
          );
        }
      } catch (err) {
        console.error("Failed to fetch domains:", err);
      } finally {
        setLoadingDomains(false);
      }
    };

    if (session) {
      fetchDomains();
    }
  }, [session]);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!newDomain.trim()) {
      setError("נא להכניס שם תחום");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/domains", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newDomain.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "משהו השתבש");
        return;
      }

      setNewDomain("");
      sessionStorage.removeItem("domains");
      window.dispatchEvent(new Event("domains-updated"));
      const refreshResponse = await fetch("/api/domains", {
        cache: "no-store",
      });
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setDomains(refreshData.domains || []);
        sessionStorage.setItem(
          "domains",
          JSON.stringify({
            data: refreshData,
            timestamp: Date.now(),
          }),
        );
      }
    } catch (err) {
      setError("משהו השתבש. נסה שוב.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDomain = async (domainId: string, domainName: string) => {
    if (
      !confirm(
        `האם אתה בטוח שברצונך למחוק את התחום "${domainName}"? פעולה זו לא ניתנת לביטול.`,
      )
    ) {
      return;
    }

    setDeletingDomain(domainId);
    setError("");

    try {
      const response = await fetch(`/api/domains?id=${domainId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "משהו השתבש");
        return;
      }

      sessionStorage.removeItem("domains");
      window.dispatchEvent(new Event("domains-updated"));
      const refreshResponse = await fetch("/api/domains", {
        cache: "no-store",
      });
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setDomains(refreshData.domains || []);
        sessionStorage.setItem(
          "domains",
          JSON.stringify({
            data: refreshData,
            timestamp: Date.now(),
          }),
        );
      }
    } catch (err) {
      setError("משהו השתבש. נסה שוב.");
    } finally {
      setDeletingDomain(null);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">הגדרות</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          נהל את ההגדרות של החשבון שלך
        </p>
      </div>

      <div className="space-y-6 rounded-lg border p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">פרופיל</h2>
            <p className="text-muted-foreground text-sm">
              עדכן את פרטי הפרופיל שלך
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">אימייל</Label>
            <Input
              id="email"
              type="email"
              value={session?.user?.email || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-muted-foreground text-xs">
              האימייל לא ניתן לשינוי
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">שם</Label>
            <Input
              id="name"
              type="text"
              placeholder="הכנס שם"
              defaultValue={session?.user?.name || ""}
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">אבטחה</h2>
              <p className="text-muted-foreground text-sm">
              נהל את הגדרות האבטחה של החשבון
            </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">שינוי סיסמה</Label>
              <Input
                id="password"
                type="password"
                placeholder="סיסמה חדשה"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">אימות סיסמה</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="הכנס שוב את הסיסמה"
              />
            </div>

            <Button>שמור שינויים</Button>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">ניהול תחומים</h2>
              <p className="text-muted-foreground text-sm">
                הוסף תחומים חדשים לרשימת התחומים הזמינים
              </p>
            </div>

            <form onSubmit={handleAddDomain} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newDomain">הוסף תחום חדש</Label>
                <div className="flex gap-2">
                  <Input
                    id="newDomain"
                    type="text"
                    placeholder="לדוגמה: פיתוח, שיווק, תמיכה"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    disabled={loading}
                  />
                  <Button type="submit" disabled={loading}>
                    {loading ? "מוסיף..." : "הוסף"}
                  </Button>
                </div>
                {error && (
                  <p className="text-destructive text-sm">{error}</p>
                )}
              </div>
            </form>

            <div className="space-y-2">
              <Label>תחומים קיימים</Label>
              {loadingDomains ? (
                <p className="text-muted-foreground text-sm">טוען תחומים...</p>
              ) : domains.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  אין תחומים עדיין
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {domains.map((domain) => (
                    <div
                      key={domain.id}
                      className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800"
                    >
                      <span>{domain.name}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteDomain(domain.id, domain.name)}
                        disabled={deletingDomain === domain.id}
                        className="hover:text-destructive rounded-full p-0.5 transition-colors disabled:opacity-50"
                        aria-label={`מחק ${domain.name}`}
                      >
                        <Icons.x className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
