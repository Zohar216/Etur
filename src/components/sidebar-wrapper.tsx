"use client";

import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";

import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";

export const SidebarWrapper = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const locale = useLocale();
  const hasSidebar = !!session;
  const isRTL = locale === "he";

  return (
    <>
      <Sidebar />
      <main
        className={cn(
          "min-h-screen flex-1 transition-all",
          hasSidebar && (isRTL ? "mr-64" : "ml-64"),
        )}
      >
        {children}
      </main>
    </>
  );
};
