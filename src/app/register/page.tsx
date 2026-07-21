"use client";

import { useState, useActionState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { registerBodegaAction, inviteTeamMemberAction, RegisterActionResult, InviteMemberResult } from "@/actions/auth-actions";
import { signIn } from "next-auth/react";
import {
  Store,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Building2,
  Lock,
  UserPlus,
  Mail,
  Users,
} from "lucide-react";

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

  // Form State
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

  // Derivar el paso activo: si el registro tuvo éxito, forzar paso 3 (invitaciones)
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
    <div className="min-h-dvh bg-gray-100 dark:bg-zinc-800 dark:bg-zinc-950 flex flex-col justify-between p-4 sm:p-6 font-sans text-gray-900 dark:text-zinc-50 dark:text-zinc-50">
      {/* Header Logo */}
      <header className="max-w-md mx-auto w-full flex items-center justify-between py-4">
        <Link
          href="/"
          className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 rounded-md p-1"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xl">
            <Store className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-2xl font-black text-gray-900 dark:text-zinc-50 dark:text-zinc-50 tracking-tight uppercase">
            Caja<span className="text-emerald-700 dark:text-emerald-400">RUS</span>
          </span>
        </Link>

        <Link
          href="/login"
          className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-zinc-300 border-2 border-gray-900 dark:border-zinc-600 rounded-xl px-3 py-2 hover:bg-gray-900 hover:text-white dark:hover:bg-zinc-800 transition-colors"
        >
          Ingresar
        </Link>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto w-full my-auto">
        <div className="bg-white dark:bg-zinc-900 dark:bg-zinc-900 border-2 border-gray-900 dark:border-zinc-700 rounded-xl p-5 sm:p-7">
          {/* Header Progress Bar for steps 1 and 2 */}
          {currentStep > 0 && currentStep < 3 && (
            <div className="mb-6 border-b-2 border-gray-200 dark:border-zinc-800 pb-4">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-gray-700 dark:text-zinc-300 mb-2">
                <span>REGISTRO DE BODEGA</span>
                <span className="font-mono bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 px-2 py-0.5 rounded text-gray-900 dark:text-zinc-50">
                  PASO {currentStep} DE 2
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden border border-gray-300 dark:border-zinc-700">
                <div
                  className="bg-emerald-700 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 2) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* PANTALLA 0: SELECCIÓN INICIAL (GOOGLE VS REGISTRO CON CORREO) */}
          {/* ─────────────────────────────────────────────────────────── */}
          {currentStep === 0 && (
            <div className="flex flex-col gap-5">
              <div className="text-center border-b-2 border-gray-200 dark:border-zinc-800 pb-4">
                <div className="inline-flex items-center gap-1.5 bg-emerald-100 border border-emerald-400 text-emerald-950 rounded-md px-3 py-1 text-[10px] font-bold tracking-widest uppercase mb-2">
                  <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>NUEVA BODEGA</span>
                </div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-zinc-50 uppercase tracking-tight">
                  REGISTRAR MI BODEGA
                </h1>
                <p className="text-xs text-gray-600 dark:text-zinc-400 font-medium mt-1">
                  Selecciona cómo prefieres crear tu cuenta para comenzar a operar.
                </p>
              </div>

              {/* Opción 1: Continuar con Google (1-clic) */}
              <div className="border-2 border-emerald-300 rounded-xl p-4 bg-emerald-50 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-700 text-white rounded px-2 py-0.5 ">
                    OPCIÓN 1
                  </span>
                  <span className="text-xs font-bold text-emerald-950 uppercase">
                    Acceso rápido en 1 Clic
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/tenants" })}
                  className="w-full bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-700 rounded-xl py-3.5 px-4 text-xs font-bold text-gray-900 dark:text-zinc-50 flex items-center justify-center gap-3 hover:bg-gray-100 dark:bg-zinc-800 active:scale-95 transition-transform cursor-pointer min-h-[52px]"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  CONTINUAR CON GOOGLE
                </button>
              </div>

              {/* Visual Divider */}
              <div className="relative my-1 flex items-center justify-center">
                <hr className="w-full border-gray-300 dark:border-zinc-700" />
                <span className="absolute bg-white dark:bg-zinc-900 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                  O REGÍSTRATE CON FORMULARIO
                </span>
              </div>

              {/* Opción 2: Registrarme con Correo y Contraseña */}
              <div className="border-2 border-gray-300 dark:border-zinc-700 rounded-xl p-4 bg-gray-50 dark:bg-zinc-800 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-gray-900 text-white rounded px-2 py-0.5 ">
                    OPCIÓN 2
                  </span>
                  <span className="text-xs font-bold text-gray-900 dark:text-zinc-50 uppercase">
                    Formulario por Pasos
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setUserStep(1)}
                  className="w-full bg-emerald-700 text-white rounded-xl py-4 px-4 text-xs font-black uppercase tracking-wider hover:bg-emerald-800 active:scale-95 transition-transform cursor-pointer border-2 border-emerald-900 min-h-[56px] flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4 stroke-[2.5]" />
                  REGISTRARME CON CORREO ELECTRÓNICO
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              <div className="pt-2 text-center">
                <p className="text-xs text-gray-600 dark:text-zinc-400 font-medium">¿Ya tienes cuenta?</p>
                <Link
                  href="/login"
                  className="text-xs font-black uppercase tracking-wider text-emerald-700 hover:underline"
                >
                  Ingresar a mi cuenta de bodega ➔
                </Link>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* PASOS DE FORMULARIO (1 & 2)                                 */}
          {/* ─────────────────────────────────────────────────────────── */}
          {currentStep > 0 && currentStep < 3 && (
            <form action={formAction} className="flex flex-col gap-5">
              {registerState.message && !registerState.success && (
                <div
                  role="alert"
                  className="bg-red-100 border-2 border-red-400 text-red-700 dark:text-red-300 p-4 rounded-xl text-xs font-medium flex items-start gap-2.5"
                >
                  <AlertCircle className="w-5 h-5 text-red-700 dark:text-red-400 shrink-0 mt-0.5 stroke-[2.5]" />
                  <div>
                    <p className="font-black uppercase tracking-wider text-[11px]">ATENCIÓN</p>
                    <p className="mt-0.5">{registerState.message}</p>
                  </div>
                </div>
              )}

              {/* PASO 1: DATOS PERSONALES + CONTRASEÑA */}
              {currentStep === 1 && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-900 dark:text-zinc-50 pb-1 border-b border-gray-200 dark:border-zinc-800">
                    <User className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
                    <span>PASO 1 · DATOS PERSONALES Y CLAVE</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-xs font-black tracking-widest uppercase text-gray-800 dark:text-zinc-300">
                      Nombres y Apellidos <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="EJ. LUIS ALBERTO TORRES"
                      className="w-full border-2 border-gray-300 dark:border-zinc-700 rounded-xl py-3.5 px-4 text-sm font-medium text-gray-900 dark:text-zinc-50 bg-white dark:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 uppercase placeholder:text-gray-400"
                    />
                    {stepErrors.name && (
                      <span className="text-xs font-bold text-red-700">{stepErrors.name}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="phone" className="text-xs font-black tracking-widest uppercase text-gray-800 dark:text-zinc-300">
                      Celular / WhatsApp <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="EJ. 987 654 321"
                      className="w-full border-2 border-gray-300 dark:border-zinc-700 rounded-xl py-3.5 px-4 text-sm  font-medium text-gray-900 dark:text-zinc-50 bg-white dark:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
                    />
                    {stepErrors.phone && (
                      <span className="text-xs font-bold text-red-700">{stepErrors.phone}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-xs font-black tracking-widest uppercase text-gray-800 dark:text-zinc-300">
                      Correo Electrónico <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="ejemplo@gmail.com"
                      className="w-full border-2 border-gray-300 dark:border-zinc-700 rounded-xl py-3.5 px-4 text-sm  font-medium text-gray-900 dark:text-zinc-50 bg-white dark:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
                    />
                    {stepErrors.email && (
                      <span className="text-xs font-bold text-red-700">{stepErrors.email}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="password" className="text-xs font-black tracking-widest uppercase text-gray-800 dark:text-zinc-300">
                        Contraseña <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="w-full border-2 border-gray-300 dark:border-zinc-700 rounded-xl py-3 px-4 text-sm  text-gray-900 dark:text-zinc-50 bg-white dark:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
                      />
                      {stepErrors.password && (
                        <span className="text-xs font-bold text-red-700">{stepErrors.password}</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="confirmPassword" className="text-xs font-black tracking-widest uppercase text-gray-800 dark:text-zinc-300">
                        Confirma Clave <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="w-full border-2 border-gray-300 dark:border-zinc-700 rounded-xl py-3 px-4 text-sm  text-gray-900 dark:text-zinc-50 bg-white dark:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
                      />
                      {stepErrors.confirmPassword && (
                        <span className="text-xs font-bold text-red-700">{stepErrors.confirmPassword}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="w-1/3 bg-white dark:bg-zinc-900 border-2 border-gray-900 text-gray-900 dark:text-zinc-50 rounded-xl py-4 text-xs font-bold uppercase tracking-wider hover:bg-gray-100 dark:bg-zinc-800 active:scale-95 transition-transform min-h-[56px] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                      VOLVER
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="w-2/3 bg-emerald-700 text-white rounded-xl py-4 px-4 text-xs font-black uppercase tracking-wider hover:bg-emerald-800 active:scale-95 transition-transform cursor-pointer border-2 border-emerald-900 min-h-[56px] flex items-center justify-center gap-2"
                    >
                      CONTINUAR A DATOS BODEGA ➔
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 2: DATOS DE LA BODEGA */}
              {currentStep === 2 && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-900 dark:text-zinc-50 pb-1 border-b border-gray-200 dark:border-zinc-800">
                    <Building2 className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
                    <span>PASO 2 · DATOS DE TU BODEGA</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="bodegaName" className="text-xs font-black tracking-widest uppercase text-gray-800 dark:text-zinc-300">
                      Nombre Comercial de tu Bodega <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="bodegaName"
                      name="bodegaName"
                      type="text"
                      required
                      value={formData.bodegaName}
                      onChange={handleInputChange}
                      placeholder="EJ. BODEGA DON LUCHO"
                      className="w-full border-2 border-gray-300 dark:border-zinc-700 rounded-xl py-3.5 px-4 text-sm font-medium text-gray-900 dark:text-zinc-50 bg-white dark:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 uppercase placeholder:text-gray-400"
                    />
                    {stepErrors.bodegaName && (
                      <span className="text-xs font-bold text-red-700">{stepErrors.bodegaName}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="rucOrDni" className="text-xs font-black tracking-widest uppercase text-gray-800 dark:text-zinc-300">
                      RUC 10 / RUC 20 o DNI (Opcional)
                    </label>
                    <input
                      id="rucOrDni"
                      name="rucOrDni"
                      type="text"
                      value={formData.rucOrDni}
                      onChange={handleInputChange}
                      placeholder="EJ. 10456789012"
                      className="w-full border-2 border-gray-300 dark:border-zinc-700 rounded-xl py-3.5 px-4 text-sm  font-medium text-gray-900 dark:text-zinc-50 bg-white dark:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="sunatRegime" className="text-xs font-black tracking-widest uppercase text-gray-800 dark:text-zinc-300">
                      Régimen SUNAT Actual
                    </label>
                    <select
                      id="sunatRegime"
                      name="sunatRegime"
                      value={formData.sunatRegime}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-300 dark:border-zinc-700 rounded-xl py-3.5 px-4 text-xs font-bold text-gray-900 dark:text-zinc-50 bg-white dark:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 uppercase"
                    >
                      <option value="NRUS">Nuevo Régimen Único Simplificado (NRUS)</option>
                      <option value="RER">Régimen Especial de Renta (RER)</option>
                      <option value="MIPE">Régimen MIPE Tributario</option>
                      <option value="GENERAL">Régimen General</option>
                    </select>
                  </div>

                  {/* Hidden inputs to send step 1 data */}
                  <input type="hidden" name="name" value={formData.name} />
                  <input type="hidden" name="phone" value={formData.phone} />
                  <input type="hidden" name="email" value={formData.email} />
                  <input type="hidden" name="password" value={formData.password} />
                  <input type="hidden" name="confirmPassword" value={formData.confirmPassword} />

                  {googleOnboardingError && (
                    <div
                      role="alert"
                      className="bg-red-100 border-2 border-red-400 text-red-700 dark:text-red-300 p-3 rounded-xl text-xs font-bold"
                    >
                      {googleOnboardingError}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-2">
                    {!isGoogleSetup && (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="w-1/3 bg-white dark:bg-zinc-900 border-2 border-gray-900 text-gray-900 dark:text-zinc-50 rounded-xl py-4 text-xs font-bold uppercase tracking-wider hover:bg-gray-100 dark:bg-zinc-800 active:scale-95 transition-transform min-h-[56px] flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                        VOLVER
                      </button>
                    )}

                    {isGoogleSetup ? (
                      <button
                        type="button"
                        onClick={handleGoogleOnboardingSubmit}
                        disabled={googleOnboardingPending}
                        className="w-full bg-emerald-700 dark:bg-emerald-600 text-white rounded-xl py-4 px-4 text-base font-semibold hover:bg-emerald-800 dark:hover:bg-emerald-700 active:scale-95 transition-transform cursor-pointer border-2 border-emerald-900 dark:border-emerald-700 min-h-[56px] flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {googleOnboardingPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                            GUARDANDO BODEGA...
                          </>
                        ) : (
                          <>
                            CREAR MI BODEGA Y ACCEDER ➔
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isPending}
                        className="w-2/3 bg-emerald-700 text-white rounded-xl py-4 px-4 text-xs font-black uppercase tracking-wider hover:bg-emerald-800 active:scale-95 transition-transform cursor-pointer border-2 border-emerald-900 min-h-[56px] flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                            REGISTRANDO BODEGA...
                          </>
                        ) : (
                          <>
                            CREAR MI BODEGA ➔
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </form>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* PASO 3 (OPCIONAL): INVITAR A COLABORADORES / CAJEROS         */}
          {/* ─────────────────────────────────────────────────────────── */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-5">
              <div className="bg-emerald-50 border-2 border-emerald-400 rounded-xl p-5 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-xl border border-emerald-900">
                  ✓
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-zinc-50 uppercase">¡BODEGA REGISTRADA CON ÉXITO!</h2>
                <p className="text-xs text-gray-800 dark:text-zinc-300 font-medium">
                  Tu bodega <strong className="font-bold uppercase text-emerald-900">{formData.bodegaName || "Registrada"}</strong> ya está activa en el sistema.
                </p>
              </div>

              {/* Panel de Invitación de Colaboradores */}
              <div className="border-2 border-gray-900 rounded-xl p-4 bg-gray-50 dark:bg-zinc-800 flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-gray-200 dark:border-zinc-800 pb-2">
                  <Users className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-zinc-50">
                    INVITAR A CAJEROS O COLABORADORES (OPCIONAL)
                  </h3>
                </div>

                {inviteState.message && (
                  <div
                    role="alert"
                    className={`p-3 rounded-xl text-xs font-bold ${
                      inviteState.success
                        ? "bg-emerald-100 text-emerald-950 border border-emerald-400"
                        : "bg-red-100 text-red-700 dark:text-red-300 border border-red-400"
                    }`}
                  >
                    {inviteState.message}
                  </div>
                )}

                <form action={inviteFormAction} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="inviteName" className="text-[11px] font-black uppercase text-gray-800 dark:text-zinc-300">
                      Nombre del Colaborador
                    </label>
                    <input
                      id="inviteName"
                      name="inviteName"
                      type="text"
                      required
                      placeholder="EJ. MARÍA PÉREZ"
                      className="w-full border-2 border-gray-300 dark:border-zinc-700 rounded-xl py-2.5 px-3 text-xs font-medium text-gray-900 dark:text-zinc-50 bg-white dark:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="inviteContact" className="text-[11px] font-black uppercase text-gray-800 dark:text-zinc-300">
                        Celular o Correo
                      </label>
                      <input
                        id="inviteContact"
                        name="inviteContact"
                        type="text"
                        required
                        placeholder="ej. 987654321 o maria@gmail.com"
                        className="w-full border-2 border-gray-300 dark:border-zinc-700 rounded-xl py-2.5 px-3 text-xs font-medium text-gray-900 dark:text-zinc-50 bg-white dark:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="role" className="text-[11px] font-black uppercase text-gray-800 dark:text-zinc-300">
                        Rol asignado
                      </label>
                      <select
                        id="role"
                        name="role"
                        defaultValue="CASHIER"
                        className="w-full border-2 border-gray-300 dark:border-zinc-700 rounded-xl py-2.5 px-3 text-xs font-bold text-gray-900 dark:text-zinc-50 bg-white dark:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 uppercase"
                      >
                        <option value="CASHIER">Cajero (Solo cobra y vende)</option>
                        <option value="ADMIN">Administrador (Control total)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isInvitePending}
                    className="w-full bg-gray-900 text-white rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-wider hover:bg-black active:scale-95 transition-transform cursor-pointer flex items-center justify-center gap-2 mt-1"
                  >
                    {isInvitePending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 stroke-[2.5]" />
                        ENVIAR INVITACIÓN A COLABORADOR
                      </>
                    )}
                  </button>
                </form>

                {/* Team Members List Placeholder */}
                <div className="mt-2 pt-3 border-t border-gray-300 dark:border-zinc-700">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-400 mb-2">
                    EQUIPO DE LA BODEGA
                  </p>
                  <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl p-2 text-xs font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-emerald-700 text-white font-bold flex items-center justify-center text-[10px]">
                        TÚ
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-zinc-50 uppercase">{formData.name || "Administrador"}</p>
                        <p className="text-[10px] text-gray-500 dark:text-zinc-400">{formData.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300">
                      ADMINISTRADOR
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button to POS */}
              <Link
                href="/login"
                className="w-full bg-emerald-700 text-white rounded-xl py-4 px-6 text-xs font-black uppercase tracking-wider hover:bg-emerald-800 active:scale-95 transition-transform text-center border-2 border-emerald-900 min-h-[56px] flex items-center justify-center gap-2"
              >
                IR AL INICIO DE SESIÓN / ABRIR MI CAJA ➔
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
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
        <div className="min-h-dvh flex items-center justify-center bg-gray-100 dark:bg-zinc-800">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
