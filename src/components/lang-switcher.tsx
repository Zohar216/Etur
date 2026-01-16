import Link from "next/link";
import { useLocale } from "next-intl";
import { ComponentProps } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LangSwitcherProps = {
  className?: ComponentProps<typeof Link>["className"];
};

export const LangSwitcher = ({ className }: LangSwitcherProps) => {
  const locale = useLocale();

  const getNextLocale = () => {
    if (locale === "he") return "en";
    if (locale === "en") return "pl";
    return "he";
  };

  const getLocaleLabel = () => {
    if (locale === "he") return "EN";
    if (locale === "en") return "PL";
    return "HE";
  };

  return (
    <Link
      className={cn(
        buttonVariants({ variant: "outline", size: "icon" }),
        className,
      )}
      href={`/${getNextLocale()}`}
    >
      {getLocaleLabel()}
    </Link>
  );
};
