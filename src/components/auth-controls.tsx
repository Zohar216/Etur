"use client";

import Link from "next/link";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

type AuthControlsProps = {
  session: Session | null;
};

export const AuthControls = ({ session }: AuthControlsProps) => {
  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button variant="outline">התחבר</Button>
        </Link>
        <Link href="/register">
          <Button>הרשם</Button>
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
        התנתק
      </Button>
    </div>
  );
};
