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
  console.log("[SettingsContext] SettingsProvider initialized");
  const settingsState = useSettings();

  // Wrap the updateSettings function to add logging
  const originalUpdateSettings = settingsState.updateSettings;
  const wrappedUpdateSettings = async (newSettings: Partial<SiteSettings>) => {
    console.log("[SettingsContext] updateSettings called via context", {
      timestamp: new Date().toISOString(),
    });
    return await originalUpdateSettings(newSettings);
  };

  return (
    <SettingsContext.Provider
      value={{
        ...settingsState,
        updateSettings: wrappedUpdateSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  console.log("[SettingsContext] useSettingsContext hook called");
  const context = useContext(SettingsContext);
  if (context === undefined) {
    console.warn(
      "[SettingsContext] Context is undefined! Using default settings",
    );
    // Return default settings if context is not available (e.g., during SSR)
    return {
      settings: defaultSiteConfig,
      loading: false,
      error: null,
      updateSettings: async () => {
        console.error(
          "[SettingsContext] updateSettings called on fallback context!",
        );
        return false;
      },
      resetToDefaults: async () => {
        console.error(
          "[SettingsContext] resetToDefaults called on fallback context!",
        );
        return false;
      },
    };
  }
  return context;
}
