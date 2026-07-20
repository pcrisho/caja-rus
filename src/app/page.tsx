import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ProblemSolution } from "@/components/landing/ProblemSolution";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { NrusCalculator } from "@/components/landing/NrusCalculator";
import { RoleBenefits } from "@/components/landing/RoleBenefits";
import { Testimonials } from "@/components/landing/Testimonials";
import { RegisterCtaSection } from "@/components/landing/RegisterCtaSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "CajaRUS — El sistema POS e inventario para tu bodega en Perú (NRUS)",
  description:
    "Digitaliza tu bodega en Perú. Punto de Venta (POS) rápido en celular, control de inventarios, cierre de caja diario y alertas preventivas del régimen NRUS SUNAT.",
  keywords: [
    "bodega Perú",
    "POS bodega",
    "sistema de caja para bodega",
    "control de inventario",
    "NRUS SUNAT",
    "Nuevo Régimen Único Simplificado",
    "cierre de caja",
    "Yape Plin bodega",
    "facturas OCR SUNAT",
  ],
  openGraph: {
    title: "CajaRUS — El control de tu negocio, al toque",
    description: "Punto de venta móvil, inventario y control del NRUS SUNAT para bodegas en Perú.",
    siteName: "CajaRUS",
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CajaRUS — Sistema POS para bodegas en Perú",
    description: "Control de ventas, inventarios y alertas del NRUS SUNAT en tu celular.",
  },
};

export default async function Home() {
  const session = await auth();

  // Redirect active logged in users straight to their tenant workspace
  if (session?.user?.isActive) {
    const { getTenantMemberships } = await import("@/lib/tenancy");
    const memberships = await getTenantMemberships(session.user.id);
    const activeMemberships = memberships.filter((m) => m.isActive);

    if (activeMemberships.length === 0) {
      // Usuario sin bodega configurada aún → onboarding
      redirect("/register?setup=google");
    }

    redirect("/tenants");
  }

  const isLoggedIn = Boolean(session?.user?.isActive);

  return (
    <div className="min-h-dvh flex flex-col bg-white font-sans text-gray-900 selection:bg-emerald-200 selection:text-emerald-900">
      <Navbar isLoggedIn={isLoggedIn} />
      <main className="flex-1">
        <Hero />
        <ProblemSolution />
        <FeaturesGrid />
        <NrusCalculator />
        <RoleBenefits />
        <Testimonials />
        <RegisterCtaSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
