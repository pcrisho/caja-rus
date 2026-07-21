"use client";

import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { checkEmailRegisteredAction } from "@/actions/auth-actions";
import {
  Store,
  ArrowRight,
  Loader2,
  UserPlus,
  Lock,
  Mail,
} from "lucide-react";
import { DsCard } from "@/components/design-system/DsCard";
import { DsInput } from "@/components/design-system/DsInput";
import { DsButton } from "@/components/design-system/DsButton";
import { DsBadge } from "@/components/design-system/DsBadge";
import { DsAlert } from "@/components/design-system/DsAlert";

function sanitizeCallbackUrl(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/tenants";
  }
  return value;
}

function sanitizeResolvedUrl(value: string): string {
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) return "/tenants";
    return sanitizeCallbackUrl(`${url.pathname}${url.search}`);
  } catch {
    return "/tenants";
  }
}

function LoginContent() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const callbackUrlParam = sanitizeCallbackUrl(searchParams.get("callbackUrl"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [unregisteredEmail, setUnregisteredEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setUnregisteredEmail(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMessage("Ingresa tu correo y contraseña.");
      return;
    }

    startTransition(async () => {
      const checkResult = await checkEmailRegisteredAction(cleanEmail);

      if (!checkResult.exists) {
        setUnregisteredEmail(cleanEmail);
        return;
      }

      const res = await signIn("credentials", {
        email: cleanEmail,
        password,
        redirect: false,
        callbackUrl: callbackUrlParam,
      });

      if (res?.error) {
        setErrorMessage("Contraseña incorrecta. Verifica tus datos e inténtalo de nuevo.");
      } else if (res?.url) {
        window.location.href = sanitizeResolvedUrl(res.url);
      }
    });
  };

  const errorAlerts = (
    <>
      {errorParam === "inactive" && (
        <DsAlert variant="error" message="Cuenta desactivada. Contacta al administrador o soporte de CajaRUS." />
      )}
      {errorParam === "session_expired" && (
        <DsAlert variant="warning" message="Tu sesión ha expirado. Inicia sesión nuevamente." />
      )}
      {errorParam === "OAuthAccountNotLinked" && (
        <DsAlert variant="warning" message="Este correo ya estaba registrado. Se ha habilitado la vinculación; por favor, vuelve a hacer clic en Continuar con Google para acceder." />
      )}
      {errorMessage && (
        <DsAlert variant="error" message={errorMessage} />
      )}
    </>
  );

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-zinc-950 flex flex-col justify-between p-4 sm:p-6">
      <header className="max-w-md mx-auto w-full flex items-center justify-between py-4">
        <Link
          href="/"
          className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 p-1"
        >
          <div className="w-10 h-10 bg-emerald-700 text-white flex items-center justify-center font-bold text-xl">
            <Store className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-2xl font-black text-gray-900 dark:text-zinc-50 tracking-tight uppercase">
            Caja<span className="text-emerald-700 dark:text-emerald-400">RUS</span>
          </span>
        </Link>

        <Link
          href="/register"
          className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 px-3.5 py-2 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
        >
          Registrarse
        </Link>
      </header>

      <main className="max-w-md mx-auto w-full my-auto">
        <DsCard>
          <div className="flex flex-col gap-4">
            <div className="text-center pb-4 border-b border-gray-100 dark:border-zinc-800">
              <DsBadge variant="secondary">
                <span className="flex items-center gap-1">
                  INGRESO A TU BODEGA
                </span>
              </DsBadge>
              <h1 className="text-2xl font-black text-gray-900 dark:text-zinc-50 uppercase tracking-tight mt-2">
                INICIAR SESIÓN
              </h1>
              <p className="text-xs text-gray-600 dark:text-zinc-400 font-medium mt-1">
                Ingresa tus credenciales para administrar tus ventas y caja.
              </p>
            </div>

            {errorAlerts}

            {unregisteredEmail && (
              <div
                role="alert"
                className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 p-4 flex flex-col gap-3"
              >
                <div className="flex items-start gap-2.5">
                  <UserPlus className="w-5 h-5 shrink-0 mt-0.5 stroke-[2.5]" />
                  <div>
                    <p className="font-black uppercase tracking-wider text-[11px]">
                      BODEGA NO REGISTRADA
                    </p>
                    <p className="mt-1 font-medium leading-relaxed">
                      El correo <strong className="font-bold underline">{unregisteredEmail}</strong> no está registrado en CajaRUS aún.
                    </p>
                  </div>
                </div>
                <Link
                  href={`/register?email=${encodeURIComponent(unregisteredEmail)}`}
                  className="w-full bg-amber-600 text-white py-3 px-4 text-sm font-bold uppercase tracking-wider font-mono hover:bg-amber-700 active:scale-95 transition-transform text-center flex items-center justify-center gap-2"
                >
                  REGISTRAR MI BODEGA CON ESTE CORREO
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <DsInput
                label="Correo Electrónico"
                type="email"
                placeholder="ejemplo@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={20} />}
              />

              <DsInput
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={20} />}
              />

              <DsButton
                type="submit"
                disabled={isPending}
                icon={isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : undefined}
              >
                {isPending ? "VERIFICANDO Y ACCEDIENDO..." : "INGRESAR A MI BODEGA"}
              </DsButton>
            </form>

            <div className="relative flex items-center justify-center">
              <hr className="w-full border-gray-200 dark:border-zinc-700" />
              <span className="absolute bg-white dark:bg-zinc-900 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                O ACCEDE RÁPIDO CON
              </span>
            </div>

            <DsButton
              type="button"
              variant="secondary"
              onClick={() => signIn("google", { callbackUrl: callbackUrlParam })}
              className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              CONTINUAR CON GOOGLE
            </DsButton>

            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 text-center">
              <p className="text-xs text-gray-600 dark:text-zinc-400 font-medium mb-1.5">
                ¿Primera vez en CajaRUS?
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                REGISTRAR MI BODEGA EN 3 PASOS
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
          </div>
        </DsCard>
      </main>

      <footer className="max-w-md mx-auto w-full text-center py-4 text-xs text-gray-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
        <p>© 2026 CAJARUS PERÚ · INICIO DE SESIÓN</p>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
