import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

/**
 * Solo permite rutas internas relativas (`/pos`, `/dashboard?x=1`, etc.).
 * Bloquea URLs absolutas y protocol-relative (`//evil.com`) para evitar un
 * Open Redirect vía `?callbackUrl=`. Ver docs/audit/informe-auditoria-cajarus.md #1.2.
 */
function sanitizeCallbackUrl(callbackUrl: string | undefined): string {
  if (!callbackUrl) return "/pos";
  if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return "/pos";
  }
  return callbackUrl;
}

export default async function LoginPage(props: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const session = await auth();
  const { error, callbackUrl: rawCallbackUrl } = await props.searchParams;
  const callbackUrl = sanitizeCallbackUrl(rawCallbackUrl);

  if (session?.user) {
    redirect(callbackUrl);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh p-6 bg-gray-50">
      <div className="w-full max-w-sm text-center mb-8">
        <h1 className="text-5xl font-bold text-emerald-600 mb-2">CajaRUS</h1>
        <p className="text-gray-500 text-lg">
          El control de tu negocio, al toque.
        </p>
      </div>

      {error === "inactive" && (
        <div className="bg-red-100 border border-red-200 text-red-700 p-4 rounded-xl mb-4 w-full max-w-sm text-center text-base">
          Cuenta desactivada. Contacta al administrador.
        </div>
      )}
      {error === "session_expired" && (
        <div className="bg-amber-100 border border-amber-200 text-amber-700 p-4 rounded-xl mb-4 w-full max-w-sm text-center text-base">
          Tu sesión expiró. Inicia sesión nuevamente.
        </div>
      )}

      <form
        action={async () => {
          "use server";
          try {
            await signIn("google", { redirectTo: callbackUrl });
          } catch (error) {
            if (error instanceof AuthError) {
              redirect(`/login?error=${error.type}`);
            }
            throw error;
          }
        }}
      >
        <button
          type="submit"
          className="w-full max-w-sm bg-white border-2 border-gray-300 rounded-xl py-5 px-6 text-lg font-semibold flex items-center justify-center gap-3 hover:bg-gray-50 active:scale-95 transition-transform cursor-pointer"
        >
          <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
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
          Iniciar sesión con Google
        </button>
      </form>

      <p className="text-sm text-gray-400 mt-8 text-center">
        Solo usuarios autorizados de la bodega.
      </p>
    </div>
  );
}
