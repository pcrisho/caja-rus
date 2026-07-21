"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="w-full bg-red-600 text-white rounded-xl py-4 px-6 text-lg font-semibold hover:bg-red-700 active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer"
    >
      <LogOut size={20} />
      CERRAR SESIÓN
    </button>
  );
}
