"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { DsButton } from "@/components/design-system/DsButton";

export function LogoutButton() {
  return (
    <DsButton
      type="button"
      variant="destructive"
      onClick={() => signOut({ callbackUrl: "/login" })}
      icon={<LogOut size={20} />}
    >
      CERRAR SESIÓN
    </DsButton>
  );
}
