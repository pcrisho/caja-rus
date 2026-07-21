"use client";

import { useState, useTransition } from "react";
import { UserRole } from "@/generated/prisma/enums";

type Member = {
  id: string;
  role: UserRole;
  isActive: boolean;
  user: {
    name: string | null;
    email: string | null;
  };
};

type Props = {
  tenantSlug: string;
  initialMembers: Member[];
};

let updateMemberRoleAction: (
  tenantSlug: string,
  memberId: string,
  role: UserRole
) => Promise<{ success: boolean; data?: any; error?: string }>;

let deactivateMemberAction: (
  tenantSlug: string,
  memberId: string
) => Promise<{ success: boolean; data?: any; error?: string }>;

import("@/actions/settings").then((m) => {
  updateMemberRoleAction = m.updateMemberRoleAction;
  deactivateMemberAction = m.deactivateMemberAction;
});

export function UsersClient({ tenantSlug, initialMembers }: Props) {
  const [members, setMembers] = useState(initialMembers);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const handleRoleChange = (memberId: string, newRole: string) => {
    startTransition(async () => {
      if (!updateMemberRoleAction) return;
      const res = await updateMemberRoleAction(tenantSlug, memberId, newRole as UserRole);
      if (res.success) {
        setMembers((prev) => prev.map(m => m.id === memberId ? { ...m, role: newRole as UserRole } : m));
        setMsg({ type: "ok", text: "Rol actualizado correctamente." });
      } else {
        setMsg({ type: "err", text: res.error || "Error al actualizar rol." });
      }
    });
  };

  const handleDeactivate = (memberId: string) => {
    if (!confirm("¿Seguro que deseas desactivar a este usuario? Ya no podrá acceder a esta bodega.")) return;
    startTransition(async () => {
      if (!deactivateMemberAction) return;
      const res = await deactivateMemberAction(tenantSlug, memberId);
      if (res.success) {
        setMembers((prev) => prev.map(m => m.id === memberId ? { ...m, isActive: false } : m));
        setMsg({ type: "ok", text: "Usuario desactivado." });
      } else {
        setMsg({ type: "err", text: res.error || "Error al desactivar." });
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {msg && (
        <div className={`p-4 rounded-xl border font-semibold ${msg.type === "ok" ? "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300" : "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300"}`}>
          {msg.text}
        </div>
      )}

      {members.map((member) => (
        <div key={member.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-gray-900 dark:text-zinc-50">{member.user.name || "Sin nombre"}</p>
              <p className="text-sm text-gray-500 dark:text-zinc-400">{member.user.email}</p>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-bold ${member.isActive ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400"}`}>
              {member.isActive ? "Activo" : "Inactivo"}
            </span>
          </div>
          
          {member.isActive && (
            <div className="flex gap-2 items-center justify-between border-t border-gray-100 dark:border-zinc-800 pt-3 mt-1">
              <select
                value={member.role}
                onChange={(e) => handleRoleChange(member.id, e.target.value)}
                disabled={isPending}
                className="border-2 border-gray-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm font-semibold text-gray-900 dark:text-zinc-50 focus-visible:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 bg-white dark:bg-zinc-900"
              >
                <option value="ADMIN">Administrador</option>
                <option value="CASHIER">Cajero</option>
              </select>
              
              <button
                onClick={() => handleDeactivate(member.id)}
                disabled={isPending}
                className="text-red-600 dark:text-red-400 font-semibold text-sm bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
              >
                Desactivar
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
