"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

import { Avatar } from "@/components/avatar";
import { Icons } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    {
      title: "לוח משימות",
      href: "/",
      icon: Icons.dashboard,
      requiresAuth: true,
    },
    {
      title: "משימות שלי",
      href: "/tasks/my",
      icon: Icons.myTasks,
      requiresAuth: true,
    },
    {
      title: "משתמשים",
      href: "/users",
      icon: Icons.users,
      requiresAuth: true,
    },
  ];

  if (!session) {
    return null;
  }

  return (
    <aside
      data-sidebar
      className={cn(
        "bg-background fixed top-0 z-30 h-screen w-64 transition-transform",
        "right-0 border-l",
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="font-mono text-lg font-bold">
            next-starter
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 pt-2">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2 bg-muted/50 mb-2">
            <Avatar
              name={session.user?.name || null}
              email={session.user?.email || ""}
              image={session.user?.image || null}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {session.user?.name || session.user?.email || "משתמש"}
              </p>
              {session.user?.name && (
                <p className="text-muted-foreground text-xs truncate">
                  {session.user?.email}
                </p>
              )}
              {(session.user as any)?.role && (
                <p className="text-muted-foreground text-xs mt-0.5">
                  {(session.user as any)?.role}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="התנתק"
              onClick={async () => await signOut({ callbackUrl: "/login" })}
              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
            >
              <Icons.logOut className="h-4 w-4" />
            </Button>
          </div>
          <div className="border-t pt-10 flex items-center gap-2">
            <Button
              asChild
              variant={pathname === "/settings" ? "default" : "outline"}
              size="icon"
              aria-label="הגדרות"
              className={cn(
                pathname === "/settings" 
                  ? "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground" 
                  : "hover:bg-transparent hover:text-muted-foreground"
              )}
            >
              <Link href="/settings">
                <Icons.settings className="h-5 w-5" />
              </Link>
            </Button>
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </aside>
  );
};
