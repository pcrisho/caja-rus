"use client";

import { useState, useActionState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { registerBodegaAction, inviteTeamMemberAction, RegisterActionResult, InviteMemberResult } from "@/actions/auth-actions";
import { signIn } from "next-auth/react";
import {
  Store,
  ArrowRight,
  ArrowLeft,
  UserPlus,
  Loader2,
  User,
  Building2,
  Mail,
  Users,
  CheckCircle2,
} from "lucide-react";
import { DsCard } from "@/components/design-system/DsCard";
import { DsInput } from "@/components/design-system/DsInput";
import { DsSelect } from "@/components/design-system/DsSelect";
import { DsButton } from "@/components/design-system/DsButton";
import { DsAlert } from "@/components/design-system/DsAlert";
import { DsBadge } from "@/components/design-system/DsBadge";
import { DsProgressBar } from "@/components/design-system/DsProgressBar";

const initialRegisterState: RegisterActionResult = {
  success: false,
  message: "",
};

const initialInviteState: InviteMemberResult = {
  success: false,
  message: "",
};

import { useSession } from "next-auth/react";
import { completeGoogleOnboardingAction } from "@/actions/auth-actions";

function RegisterContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const isGoogleSetup = searchParams.get("setup") === "google";
  const { data: session, update: updateSession } = useSession();

  const initialStep = isGoogleSetup ? 2 : emailParam ? 1 : 0;
  const [userStep, setUserStep] = useState<number>(initialStep);

  const [registerState, formAction, isPending] = useActionState(registerBodegaAction, initialRegisterState);
  const [inviteState, inviteFormAction, isInvitePending] = useActionState(inviteTeamMemberAction, initialInviteState);
  const [googleOnboardingPending, setGoogleOnboardingPending] = useState(false);
  const [googleOnboardingError, setGoogleOnboardingError] = useState("");

  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    phone: "",
    email: session?.user?.email || emailParam,
    bodegaName: "",
    rucOrDni: "",
    sunatRegime: "NRUS",
    password: "",
    confirmPassword: "",
  });

  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  const currentStep = registerState.success ? 3 : userStep;

  const handleGoogleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleOnboardingError("");

    if (!formData.bodegaName.trim()) {
      setGoogleOnboardingError("Ingresa el nombre comercial de tu bodega.");
      return;
    }

    if (!session?.user?.id) {
      setGoogleOnboardingError("No se pudo obtener la sesión actual. Inicia sesión nuevamente.");
      return;
    }

    setGoogleOnboardingPending(true);
    try {
      const res = await completeGoogleOnboardingAction(
        session.user.id,
        formData.bodegaName,
        formData.phone,
        formData.sunatRegime
      );

      if (!res.success) {
        setGoogleOnboardingError(res.message);
        setGoogleOnboardingPending(false);
        return;
      }

      await updateSession();
      window.location.href = res.tenantSlug ? `/t/${res.tenantSlug}/pos` : "/tenants";
    } catch (err) {
      console.error("[Google Onboarding Error]:", err);
      setGoogleOnboardingError("Ocurrió un error al guardar la bodega.");
      setGoogleOnboardingPending(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setStepErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = "Ingresa tus nombres y apellidos completos.";
    }
    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (!formData.phone.trim() || phoneDigits.length < 7) {
      errors.phone = "Ingresa un celular o WhatsApp válido (mínimo 7 dígitos).";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errors.email = "Ingresa un correo electrónico válido.";
    }
    if (!formData.password || formData.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres.";
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden.";
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (!formData.bodegaName.trim() || formData.bodegaName.trim().length < 2) {
      errors.bodegaName = "Ingresa el nombre comercial de tu bodega.";
    }
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setUserStep(2);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setUserStep((prev) => prev - 1);
    }
  };

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
          href="/login"
          className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-zinc-300 hover:underline transition-colors"
        >
          Ingresar
        </Link>
      </header>

      <main className="max-w-md mx-auto w-full my-auto">
        <DsCard>
          <div className="flex flex-col gap-5">
            {currentStep > 0 && currentStep < 3 && (
              <div className="pb-4 border-b border-gray-100 dark:border-zinc-800">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-gray-700 dark:text-zinc-300 mb-2">
                  <span>REGISTRO DE BODEGA</span>
                  <DsBadge variant="secondary">PASO {currentStep} DE 2</DsBadge>
                </div>
                <DsProgressBar value={currentStep * 50} max={100} size="sm" showValue={false} />
              </div>
            )}

            {currentStep === 0 && (
              <div className="flex flex-col gap-5">
                <div className="text-center pb-4 border-b border-gray-100 dark:border-zinc-800">
                  <DsBadge variant="success">
                    <span className="flex items-center gap-1">
                      <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                      NUEVA BODEGA
                    </span>
                  </DsBadge>
                  <h1 className="text-2xl font-black text-gray-900 dark:text-zinc-50 uppercase tracking-tight mt-2">
                    REGISTRAR MI BODEGA
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-zinc-400 font-medium mt-1">
                    Selecciona cómo prefieres crear tu cuenta para comenzar a operar.
                  </p>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <DsBadge variant="default">OPCIÓN 1</DsBadge>
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase">
                      Acceso rápido en 1 Clic
                    </span>
                  </div>
                  <DsButton
                    type="button"
                    variant="secondary"
                    onClick={() => signIn("google", { callbackUrl: "/tenants" })}
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
                </div>

                <div className="relative flex items-center justify-center">
                  <hr className="w-full border-gray-200 dark:border-zinc-700" />
                  <span className="absolute bg-white dark:bg-zinc-900 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                    O REGÍSTRATE CON FORMULARIO
                  </span>
                </div>

                <div className="bg-gray-50 dark:bg-zinc-800 p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <DsBadge variant="secondary">OPCIÓN 2</DsBadge>
                    <span className="text-xs font-bold text-gray-900 dark:text-zinc-50 uppercase">
                      Formulario por Pasos
                    </span>
                  </div>
                  <DsButton
                    type="button"
                    onClick={() => setUserStep(1)}
                    icon={<Mail className="w-4 h-4 stroke-[2.5]" />}
                  >
                    REGISTRARME CON CORREO ELECTRÓNICO
                  </DsButton>
                </div>

                <div className="pt-2 text-center">
                  <p className="text-xs text-gray-600 dark:text-zinc-400 font-medium">¿Ya tienes cuenta?</p>
                  <Link
                    href="/login"
                    className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    Ingresar a mi cuenta de bodega
                  </Link>
                </div>
              </div>
            )}

            {currentStep > 0 && currentStep < 3 && (
              <form action={formAction} className="flex flex-col gap-5">
                {registerState.message && !registerState.success && (
                  <DsAlert variant="error" message={registerState.message} />
                )}

                {currentStep === 1 && (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-900 dark:text-zinc-50 pb-1 border-b border-gray-100 dark:border-zinc-800">
                      <User className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
                      <span>PASO 1 · DATOS PERSONALES Y CLAVE</span>
                    </div>

                    <DsInput
                      label="Nombres y Apellidos"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="EJ. LUIS ALBERTO TORRES"
                      error={stepErrors.name}
                    />

                    <DsInput
                      label="Celular / WhatsApp"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="EJ. 987 654 321"
                      error={stepErrors.phone}
                    />

                    <DsInput
                      label="Correo Electrónico"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="ejemplo@gmail.com"
                      error={stepErrors.email}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <DsInput
                        label="Contraseña"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        error={stepErrors.password}
                      />
                      <DsInput
                        label="Confirma Clave"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        error={stepErrors.confirmPassword}
                      />
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      <DsButton
                        type="button"
                        variant="secondary"
                        onClick={prevStep}
                        size="lg"
                        className="w-1/3"
                        icon={<ArrowLeft className="w-4 h-4 stroke-[2.5]" />}
                      >
                        VOLVER
                      </DsButton>
                      <DsButton
                        type="button"
                        onClick={nextStep}
                        size="lg"
                        className="w-2/3"
                      >
                        CONTINUAR A DATOS BODEGA
                      </DsButton>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-900 dark:text-zinc-50 pb-1 border-b border-gray-100 dark:border-zinc-800">
                      <Building2 className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
                      <span>PASO 2 · DATOS DE TU BODEGA</span>
                    </div>

                    <DsInput
                      label="Nombre Comercial de tu Bodega"
                      name="bodegaName"
                      value={formData.bodegaName}
                      onChange={handleInputChange}
                      placeholder="EJ. BODEGA DON LUCHO"
                      error={stepErrors.bodegaName}
                    />

                    <DsInput
                      label="RUC 10 / RUC 20 o DNI (Opcional)"
                      name="rucOrDni"
                      value={formData.rucOrDni}
                      onChange={handleInputChange}
                      placeholder="EJ. 10456789012"
                    />

                    <DsSelect
                      label="Régimen SUNAT Actual"
                      name="sunatRegime"
                      value={formData.sunatRegime}
                      onChange={handleInputChange}
                      options={[
                        { value: "NRUS", label: "Nuevo Régimen Único Simplificado (NRUS)" },
                        { value: "RER", label: "Régimen Especial de Renta (RER)" },
                        { value: "MIPE", label: "Régimen MIPE Tributario" },
                        { value: "GENERAL", label: "Régimen General" },
                      ]}
                    />

                    <input type="hidden" name="name" value={formData.name} />
                    <input type="hidden" name="phone" value={formData.phone} />
                    <input type="hidden" name="email" value={formData.email} />
                    <input type="hidden" name="password" value={formData.password} />
                    <input type="hidden" name="confirmPassword" value={formData.confirmPassword} />

                    {googleOnboardingError && (
                      <DsAlert variant="error" message={googleOnboardingError} />
                    )}

                    <div className="flex items-center gap-3 mt-2">
                      {!isGoogleSetup && (
                        <DsButton
                          type="button"
                          variant="secondary"
                          onClick={prevStep}
                          size="lg"
                          className="w-1/3"
                          icon={<ArrowLeft className="w-4 h-4 stroke-[2.5]" />}
                        >
                          VOLVER
                        </DsButton>
                      )}

                      {isGoogleSetup ? (
                        <DsButton
                          type="button"
                          onClick={handleGoogleOnboardingSubmit}
                          disabled={googleOnboardingPending}
                          icon={googleOnboardingPending ? <Loader2 className="w-5 h-5 animate-spin" /> : undefined}
                        >
                          {googleOnboardingPending ? "GUARDANDO BODEGA..." : "CREAR MI BODEGA Y ACCEDER"}
                        </DsButton>
                      ) : (
                        <DsButton
                          type="submit"
                          disabled={isPending}
                          className={!isGoogleSetup ? "w-2/3" : ""}
                          icon={isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : undefined}
                        >
                          {isPending ? "REGISTRANDO BODEGA..." : "CREAR MI BODEGA"}
                        </DsButton>
                      )}
                    </div>
                  </div>
                )}
              </form>
            )}

            {currentStep === 3 && (
              <div className="flex flex-col gap-5">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 p-5 text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-700 text-white flex items-center justify-center font-black text-xl">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-zinc-50 uppercase">¡BODEGA REGISTRADA CON ÉXITO!</h2>
                  <p className="text-xs font-medium">
                    Tu bodega <strong className="font-bold uppercase">{formData.bodegaName || "Registrada"}</strong> ya está activa en el sistema.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-zinc-800 p-4 flex flex-col gap-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-zinc-800">
                    <Users className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-zinc-50">
                      INVITAR A CAJEROS O COLABORADORES (OPCIONAL)
                    </h3>
                  </div>

                  {inviteState.message && (
                    <DsAlert
                      variant={inviteState.success ? "success" : "error"}
                      message={inviteState.message}
                    />
                  )}

                  <form action={inviteFormAction} className="flex flex-col gap-3">
                    <DsInput
                      label="Nombre del Colaborador"
                      name="inviteName"
                      placeholder="EJ. MARÍA PÉREZ"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <DsInput
                        label="Celular o Correo"
                        name="inviteContact"
                        placeholder="ej. 987654321 o maria@gmail.com"
                      />
                      <DsSelect
                        label="Rol asignado"
                        name="role"
                        options={[
                          { value: "CASHIER", label: "Cajero (Solo cobra y vende)" },
                          { value: "ADMIN", label: "Administrador (Control total)" },
                        ]}
                      />
                    </div>

                    <DsButton
                      type="submit"
                      disabled={isInvitePending}
                      variant="secondary"
                      icon={isInvitePending ? undefined : <UserPlus className="w-4 h-4 stroke-[2.5]" />}
                    >
                      {isInvitePending ? "ENVIANDO..." : "ENVIAR INVITACIÓN A COLABORADOR"}
                    </DsButton>
                  </form>

                  <div className="pt-3 border-t border-gray-200 dark:border-zinc-700">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-400 mb-2">
                      EQUIPO DE LA BODEGA
                    </p>
                    <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-2 text-xs font-medium">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 bg-emerald-700 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                          TÚ
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 dark:text-zinc-50 uppercase truncate">{formData.name || "Administrador"}</p>
                          <p className="text-[10px] text-gray-500 dark:text-zinc-400 truncate">{formData.email}</p>
                        </div>
                      </div>
                      <DsBadge variant="success">ADMINISTRADOR</DsBadge>
                    </div>
                  </div>
                </div>

                <Link
                  href="/login"
                  className="block w-full bg-emerald-600 text-white py-4 px-6 text-lg font-semibold font-mono hover:bg-emerald-700 active:scale-95 transition-transform text-center"
                >
                  IR AL INICIO DE SESIÓN / ABRIR MI CAJA
                </Link>
              </div>
            )}
          </div>
        </DsCard>
      </main>

      <footer className="max-w-md mx-auto w-full text-center py-4 text-xs text-gray-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
        <p>© 2026 CAJARUS PERÚ · REGISTRO E INVITACIÓN</p>
      </footer>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
