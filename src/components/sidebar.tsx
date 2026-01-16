"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";

import { Icons } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const locale = useLocale();

  const isRTL = locale === "he";

  const navItems = [
    {
      title: "משימות",
      href: `/${locale}/tasks`,
      icon: Icons.tasks,
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
        isRTL ? "right-0 border-l" : "left-0 border-r",
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <Link href={`/${locale}`} className="font-mono text-lg font-bold">
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
      </div>
    </aside>
  );
};
