"use client";

import { useSession } from "next-auth/react";

import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";

export const SidebarWrapper = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const hasSidebar = !!session;

  return (
    <>
      {hasSidebar && <Sidebar />}
      <main
        className={cn(
          "min-h-screen flex-1 transition-all",
          hasSidebar && "mr-64",
        )}
      >
        {children}
      </main>
    </>
  );
};
