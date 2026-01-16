"use client";

import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";

import { LangSwitcher } from "@/components/lang-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { cn } from "@/lib/utils";

export const FloatingControls = () => {
  const { data: session } = useSession();
  const locale = useLocale();
  const hasSidebar = !!session;
  const isRTL = locale === "he";

  return (
    <>
      <LangSwitcher
        className={cn(
          "fixed bottom-16 z-50",
          isRTL
            ? hasSidebar
              ? "left-[276px]"
              : "left-5"
            : hasSidebar
              ? "right-[276px]"
              : "right-5",
        )}
      />
      <ThemeSwitcher
        className={cn(
          "fixed bottom-5 z-50",
          isRTL
            ? hasSidebar
              ? "left-[276px]"
              : "left-5"
            : hasSidebar
              ? "right-[276px]"
              : "right-5",
        )}
      />
    </>
  );
};
