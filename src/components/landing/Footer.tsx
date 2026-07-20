import Link from "next/link";
import { Store, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8 border-t-4 border-emerald-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-gray-800">
          {/* Brand Col */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xl">
                <Store className="w-6 h-6 text-white stroke-[2.5]" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight uppercase">
                Caja<span className="text-emerald-400">RUS</span>
              </span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed font-medium max-w-sm">
              La plataforma móvil de punto de venta (POS), inventario, cierre de caja y alertas preventivas del régimen NRUS SUNAT para bodegas en Perú.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-emerald-400 uppercase bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 w-fit">
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              <span>SISTEMA PARA EL NRUS SUNAT · PERÚ</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <h4 className="text-xs font-black tracking-widest uppercase text-gray-400">Módulos POS</h4>
            <ul className="flex flex-col gap-2 text-xs font-bold uppercase tracking-wider text-gray-300">
              <li>
                <a href="#caracteristicas" className="hover:text-emerald-400 transition-colors">
                  Características POS
                </a>
              </li>
              <li>
                <a href="#calculadora-nrus" className="hover:text-emerald-400 transition-colors">
                  Calculadora NRUS SUNAT
                </a>
              </li>
              <li>
                <a href="#beneficios" className="hover:text-emerald-400 transition-colors">
                  Beneficios por Rol
                </a>
              </li>
              <li>
                <a href="#preguntas" className="hover:text-emerald-400 transition-colors">
                  Preguntas Frecuentes
                </a>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <h4 className="text-xs font-black tracking-widest uppercase text-gray-400">Acceso a la App</h4>
            <p className="text-xs text-gray-300 font-medium">
              ¿Ya eres usuario registrado? Ingresa a tu bodega desde cualquier celular.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link
                href="/login"
                className="bg-white/10 text-white border border-white/20 text-center rounded-lg py-3 px-5 text-xs font-bold uppercase tracking-wider hover:bg-white/20 active:scale-95 transition-transform"
              >
                Ingresar
              </Link>
              <Link
                href="/register"
                className="bg-emerald-700 text-white text-center rounded-lg py-3 px-5 text-xs font-black uppercase tracking-wider hover:bg-emerald-600 active:scale-95 transition-transform"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono font-medium text-gray-400">
          <p>© 2026 CAJARUS PERÚ · TODOS LOS DERECHOS RESERVADOS.</p>
          <p className="flex items-center gap-1 text-center">
            DISEÑADO CON <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" /> PARA BODEGAS EN PERÚ
          </p>
        </div>
      </div>
    </footer>
  );
}
