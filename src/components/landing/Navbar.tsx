"use client";

import { useState } from "react";
import Link from "next/link";
import { Store, Menu, X, ArrowRight, UserCheck } from "lucide-react";

interface NavbarProps {
  isLoggedIn?: boolean;
}

export function Navbar({ isLoggedIn = false }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-gray-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 rounded-md p-1"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xl group-hover:bg-emerald-800 transition-colors">
            <Store className="w-6 h-6 text-white stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none uppercase">
              Caja<span className="text-emerald-700">RUS</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-gray-700">
          <a
            href="#caracteristicas"
            className="hover:text-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 rounded-md px-1 py-0.5"
          >
            Módulos POS
          </a>
          <a
            href="#calculadora-nrus"
            className="hover:text-emerald-700 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 rounded-md px-1 py-0.5 text-emerald-700"
          >
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-700"></span>
            Calculadora NRUS
          </a>
          <a
            href="#beneficios"
            className="hover:text-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 rounded-md px-1 py-0.5"
          >
            Beneficios
          </a>
          <a
            href="#preguntas"
            className="hover:text-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 rounded-md px-1 py-0.5"
          >
            Preguntas
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/tenants"
              className="inline-flex items-center gap-2 bg-gray-900 text-white rounded-lg px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-black active:scale-95 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-gray-900"
            >
              <UserCheck className="w-4 h-4 stroke-[2.5]" />
              Ir a mi Bodega
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center justify-center text-gray-900 border-2 border-gray-900 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-gray-900 hover:text-white active:scale-95 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-gray-900"
              >
                Ingresar
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center bg-emerald-700 text-white rounded-lg px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-emerald-800 active:scale-95 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-gray-900"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          type="button"
          aria-label={mobileMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
          className="sm:hidden p-2 text-gray-900 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 rounded-lg border border-gray-300 bg-white cursor-pointer touch-manipulation active:scale-95"
        >
          {mobileMenuOpen ? <X className="w-6 h-6 stroke-[2.5]" /> : <Menu className="w-6 h-6 stroke-[2.5]" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b-2 border-gray-300 px-4 pt-3 pb-6 flex flex-col gap-4 shadow-lg">
          <nav className="flex flex-col gap-2 text-xs font-bold uppercase tracking-wider text-gray-800">
            <a
              href="#caracteristicas"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              Módulos POS
            </a>
            <a
              href="#calculadora-nrus"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 flex items-center justify-between"
            >
              <span>Calculadora NRUS SUNAT</span>
              <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded font-mono">
                GRATIS
              </span>
            </a>
            <a
              href="#beneficios"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              Beneficios por Rol
            </a>
            <a
              href="#preguntas"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              Preguntas Frecuentes
            </a>
          </nav>

          <div className="pt-2 flex flex-col gap-3 border-t border-gray-200">
            {isLoggedIn ? (
              <Link
                href="/tenants"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full bg-gray-900 text-white text-center rounded-lg py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-black active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4 stroke-[2.5]" />
                Ir a mi Bodega
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-emerald-700 text-white text-center rounded-lg py-4 text-xs font-bold uppercase tracking-wider hover:bg-emerald-800 active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  Registrarse ahora
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-white text-gray-900 border-2 border-gray-900 text-center rounded-lg py-3 text-xs font-bold uppercase tracking-wider hover:bg-gray-900 hover:text-white active:scale-95 transition-transform"
                >
                  Ingresar a mi cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
