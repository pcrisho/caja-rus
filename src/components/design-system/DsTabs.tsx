"use client";

import { ReactNode } from "react";

type Tab = {
  id: string;
  label: string;
  icon?: ReactNode;
};

type DsTabsProps = {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  fullWidth?: boolean;
};

export function DsTabs({
  tabs,
  activeTab,
  onChange,
  fullWidth = false,
}: DsTabsProps) {
  return (
    <div
      className={`flex gap-2 ${fullWidth ? "w-full" : "overflow-x-auto no-scrollbar"}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-blue-900 text-white"
                : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
            } ${fullWidth ? "flex-1 justify-center" : ""}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
