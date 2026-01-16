"use client";

import Link from "next/link";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

type AuthControlsProps = {
  session: Session | null;
};

export const AuthControls = ({ session }: AuthControlsProps) => {
  const t = useTranslations("home");

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button variant="outline">{t("signIn")}</Button>
        </Link>
        <Link href="/register">
          <Button>{t("signUp")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-sm">
        {session.user?.email}
      </span>
      <Button variant="outline" onClick={async () => await signOut()}>
        {t("signOut")}
      </Button>
    </div>
  );
};
