"use client";

import { useState, useTransition } from "react";
import { UserRole } from "@/generated/prisma/enums";
import { Mail, UserPlus, X, Copy, Check, Clock } from "lucide-react";
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
  initialInvites: Array<{
    id: string;
    token: string;
    email: string;
    role: UserRole;
    expiresAt: string | Date;
    createdAt: string | Date;
    consumed: boolean;
  }>;
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

let createInviteAction: (
  tenantSlug: string,
  email: string,
  role: UserRole
) => Promise<{ success: boolean; token?: string; inviteUrl?: string; error?: string }>;

let getPendingInvitesAction: (
  tenantSlug: string
) => Promise<{ success: boolean; data?: any[]; error?: string }>;

import("@/actions/settings").then((m) => {
  updateMemberRoleAction = m.updateMemberRoleAction;
  deactivateMemberAction = m.deactivateMemberAction;
});

import("@/actions/invites").then((m) => {
  createInviteAction = m.createInviteAction;
  getPendingInvitesAction = m.getPendingInvitesAction;
});

export function UsersClient({ tenantSlug, initialMembers, initialInvites }: Props) {
  const [members, setMembers] = useState(initialMembers);
  const [invites, setInvites] = useState(initialInvites);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("CASHIER");
  const [inviteMsg, setInviteMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

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
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      setInviteMsg({ type: "err", text: "Ingresa un correo electrónico válido." });
      return;
    }

    if (!createInviteAction) return;

    const res = await createInviteAction(tenantSlug, inviteEmail.trim(), inviteRole);
    if (res.success && res.inviteUrl) {
      setInviteLink(res.inviteUrl);
      setInviteMsg({ type: "ok", text: "¡Invitación creada! Copia el enlace y compártelo." });
      setInviteEmail("");
      // Refrescar la lista de invitaciones pendientes
      if (getPendingInvitesAction) {
        const pending = await getPendingInvitesAction(tenantSlug);
        if (pending.success && pending.data) setInvites(pending.data);
      }
    } else {
      setInviteMsg({ type: "err", text: res.error || "Error al crear invitación." });
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            onClick={() => {
              setShowInvite(!showInvite);
              setInviteLink("");
              setInviteMsg(null);
            }}
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

            {inviteLink ? (
              <div className="flex flex-col gap-3">
                <div className="bg-gray-100 dark:bg-zinc-800 p-3 text-sm text-gray-900 dark:text-zinc-50 font-mono break-all">
                  {inviteLink}
                </div>
                <div className="flex gap-2">
                  <DsButton
                    type="button"
                    size="md"
                    onClick={handleCopyLink}
                    icon={copied ? <Check size={16} /> : <Copy size={16} />}
                  >
                    {copied ? "COPIADO" : "COPIAR LINK"}
                  </DsButton>
                  <DsButton
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => setInviteLink("")}
                  >
                    NUEVA INVITACIÓN
                  </DsButton>
                </div>
              </div>
            ) : (
              <>
                <DsInput
                  label="Correo electrónico"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  type="email"
                  placeholder="maria@gmail.com"
                  icon={<Mail size={18} />}
                />
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200">
                    Rol asignado
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as UserRole)}
                    className="w-full appearance-none bg-transparent border-b border-gray-200 dark:border-zinc-700 py-3 pr-8 text-base text-gray-900 dark:text-zinc-50 focus-visible:outline-none focus-visible:border-blue-900 transition-colors"
                  >
                    <option value="CASHIER">Cajero (Solo cobra y vende)</option>
                    <option value="ADMIN">Administrador (Control total)</option>
                  </select>
                </div>
                <DsButton type="submit" size="md">
                  <UserPlus size={16} />
                  CREAR INVITACIÓN
                </DsButton>
              </>
            )}
          </form>
        )}
      </DsCard>

      {invites.length > 0 && (
        <DsCard variant="flat" padding="md">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-3">
            Invitaciones pendientes ({invites.length})
          </p>
          <div className="flex flex-col gap-2">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between bg-white dark:bg-zinc-900 p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-zinc-50 truncate">
                    {invite.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                    <Clock size={12} />
                    Expira {new Date(invite.expiresAt).toLocaleDateString("es-PE")}
                  </p>
                </div>
                <DsBadge variant={invite.role === "ADMIN" ? "default" : "secondary"}>
                  {invite.role === "ADMIN" ? "ADMIN" : "CAJERO"}
                </DsBadge>
              </div>
            ))}
          </div>
        </DsCard>
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
