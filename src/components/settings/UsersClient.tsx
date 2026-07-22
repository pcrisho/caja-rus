"use client";

import { useState, useTransition } from "react";
import { UserRole } from "@/generated/prisma/enums";
import { Mail, UserPlus, X } from "lucide-react";
import { DsAlert } from "@/components/design-system/DsAlert";
import { DsCard } from "@/components/design-system/DsCard";
import { DsBadge } from "@/components/design-system/DsBadge";
import { DsInput } from "@/components/design-system/DsInput";
import { DsButton } from "@/components/design-system/DsButton";

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

let inviteTeamMemberAction: (
  _prevState: any,
  formData: FormData
) => Promise<{ success: boolean; message: string }>;

import("@/actions/settings").then((m) => {
  updateMemberRoleAction = m.updateMemberRoleAction;
  deactivateMemberAction = m.deactivateMemberAction;
});

import("@/actions/auth-actions").then((m) => {
  inviteTeamMemberAction = m.inviteTeamMemberAction;
});

export function UsersClient({ tenantSlug, initialMembers }: Props) {
  const [members, setMembers] = useState(initialMembers);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteContact, setInviteContact] = useState("");
  const [inviteRole, setInviteRole] = useState("CASHIER");
  const [inviteMsg, setInviteMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

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

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteContact.trim()) {
      setInviteMsg({ type: "err", text: "Completa el nombre y el correo o celular." });
      return;
    }

    if (!inviteTeamMemberAction) return;

    const formData = new FormData();
    formData.append("inviteName", inviteName);
    formData.append("inviteContact", inviteContact);
    formData.append("role", inviteRole);

    const res = await inviteTeamMemberAction(null, formData);
    if (res.success) {
      setInviteMsg({ type: "ok", text: res.message });
      setInviteName("");
      setInviteContact("");
    } else {
      setInviteMsg({ type: "err", text: res.message });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {msg && (
        <DsAlert variant={msg.type === "ok" ? "success" : "error"} message={msg.text} />
      )}

      <DsCard variant="flat" padding="md">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Invitar colaborador
          </p>
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="text-blue-900 dark:text-blue-400 text-xs font-bold flex items-center gap-1 hover:underline"
          >
            {showInvite ? <X size={14} /> : <UserPlus size={14} />}
            {showInvite ? "Cerrar" : "Invitar"}
          </button>
        </div>

        {showInvite && (
          <form onSubmit={handleInvite} className="flex flex-col gap-3">
            {inviteMsg && (
              <DsAlert variant={inviteMsg.type === "ok" ? "success" : "error"} message={inviteMsg.text} />
            )}
            <DsInput
              label="Nombre del colaborador"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="EJ. MARÍA PÉREZ"
            />
            <DsInput
              label="Correo o celular"
              value={inviteContact}
              onChange={(e) => setInviteContact(e.target.value)}
              type="email"
              placeholder="maria@gmail.com o 987654321"
              icon={<Mail size={18} />}
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full appearance-none bg-transparent border-b border-gray-200 dark:border-zinc-700 py-3 pr-8 text-base text-gray-900 dark:text-zinc-50 focus-visible:outline-none focus-visible:border-blue-900 transition-colors"
            >
              <option value="CASHIER">Cajero (Solo cobra y vende)</option>
              <option value="ADMIN">Administrador (Control total)</option>
            </select>
            <DsButton type="submit" size="md">
              <UserPlus size={16} />
              ENVIAR INVITACIÓN
            </DsButton>
          </form>
        )}
      </DsCard>

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
