"use client";

import { useSession } from "next-auth/react";

import { ThemeSwitcher } from "@/components/theme-switcher";

export const FloatingControls = () => {
  const { data: session } = useSession();
  const hasSidebar = !!session;

  const offset = hasSidebar ? 276 : 20;

  return (
    <div
      className="fixed bottom-5 z-50"
      style={{ right: `${offset}px` }}
    >
      <ThemeSwitcher />
    </div>
  );
};
