"use client";

import { useState, useTransition } from "react";
import { UserRole } from "@/generated/prisma/enums";
import { DsAlert } from "@/components/design-system/DsAlert";
import { DsCard } from "@/components/design-system/DsCard";
import { DsBadge } from "@/components/design-system/DsBadge";

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
        <DsAlert variant={msg.type === "ok" ? "success" : "error"} message={msg.text} />
      )}

      {members.map((member) => (
        <DsCard key={member.id} variant="flat" padding="md">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-gray-900 dark:text-zinc-50">{member.user.name || "Sin nombre"}</p>
                <p className="text-sm text-gray-500 dark:text-zinc-400">{member.user.email}</p>
              </div>
              <DsBadge variant={member.isActive ? "success" : "secondary"}>
                {member.isActive ? "Activo" : "Inactivo"}
              </DsBadge>
            </div>
            
            {member.isActive && (
              <div className="flex gap-2 items-center justify-between border-t border-gray-100 dark:border-zinc-800 pt-3 mt-1">
                <select
                  value={member.role}
                  onChange={(e) => handleRoleChange(member.id, e.target.value)}
                  disabled={isPending}
                  className="appearance-none bg-transparent border-b border-gray-200 dark:border-zinc-700 py-2 pr-8 text-sm font-semibold text-gray-900 dark:text-zinc-50 focus-visible:outline-none focus-visible:border-blue-900 transition-colors"
                >
                  <option value="ADMIN">Administrador</option>
                  <option value="CASHIER">Cajero</option>
                </select>
                
                <button
                  onClick={() => handleDeactivate(member.id)}
                  disabled={isPending}
                  className="text-red-600 dark:text-red-400 font-semibold text-sm hover:underline disabled:opacity-50"
                >
                  Desactivar
                </button>
              </div>
            )}
          </div>
        </DsCard>
      ))}
    </div>
  );
}
