import React, { createContext, useContext, ReactNode } from "react";
import { SiteSettings, useSettings } from "@/hooks/useSettings";
import { siteConfig as defaultSiteConfig } from "@/config/siteConfig";

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  error: string | null;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<boolean>;
  resetToDefaults: () => Promise<boolean>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const settingsState = useSettings();

  return (
    <SettingsContext.Provider value={settingsState}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    // Return default settings if context is not available (e.g., during SSR)
    return {
      settings: defaultSiteConfig,
      loading: false,
      error: null,
      updateSettings: async () => false,
      resetToDefaults: async () => false,
    };
  }
  return context;
}
