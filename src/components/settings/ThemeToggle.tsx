"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="w-full text-left bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 p-4 font-semibold text-gray-900 dark:text-zinc-50 flex justify-between items-center transition-colors active:scale-95"
      aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      <span>Tema: {theme === "dark" ? "Oscuro" : "Claro"}</span>
      {theme === "dark" ? (
        <Sun size={20} className="text-amber-500" />
      ) : (
        <Moon size={20} className="text-gray-500" />
      )}
    </button>
  );
}
