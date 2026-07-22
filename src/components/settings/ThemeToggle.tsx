"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import { DsToggle } from "@/components/design-system/DsToggle";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <DsToggle
      label="Modo oscuro"
      description="Cambia la apariencia de la app"
      checked={theme === "dark"}
      onChange={() => toggleTheme()}
    />
  );
}
