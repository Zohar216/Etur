"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("אימייל או סיסמה שגויים");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("משהו השתבש. נסה שוב.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-lg border p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">התחברות</h1>
          <p className="text-muted-foreground text-sm">
            הכנס את האימייל והסיסמה שלך כדי להתחבר
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">אימייל</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">סיסמה</Label>
            <Input
              id="password"
              type="password"
              placeholder="הכנס את הסיסמה שלך"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="text-destructive text-sm">{error}</div>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "מתחבר..." : "התחבר"}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">אין לך חשבון? </span>
          <Link href="/register" className="text-primary hover:underline">
            הירשם
          </Link>
        </div>
      </div>
    </div>
  );
}
