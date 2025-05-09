import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import {
  db,
  isFirebaseInitialized,
  safeFirestoreOperation,
} from "@/lib/firebase";
import { siteConfig as defaultSiteConfig } from "@/config/siteConfig";

// Define the settings structure
export interface SiteSettings {
  name: string;
  description: string;
  url: string;
  contact: {
    phone: string;
    email: string;
    address: string;
    openingHours: string;
    city: string;
    region: string;
    postalCode: string;
    countryCode: string;
  };
  social: {
    facebook: string;
    facebookHandle: string;
    instagram: string;
    twitter: string;
    zalo: string;
    tiktok: string;
    tiktokHandle: string;
    messenger: string;
  };
  ordering: {
    shopeeFood: string;
    grabFood: string;
  };
  maps: {
    embedUrl: string;
    directionsUrl: string;
    latitude: string;
    longitude: string;
  };
  seo: {
    titleTemplate: string;
    defaultTitle: string;
    defaultDescription: string;
    ogImageUrl: string;
    twitterHandle: string;
    keywords: string;
    homePageTitle: string;
  };
  settings: {
    currency: string;
    currencySymbol: string;
    locale: string;
  };
  // Additional field for tracking updates
  updatedAt?: any;
}

interface UseSettingsReturn {
  settings: SiteSettings;
  loading: boolean;
  error: string | null;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<boolean>;
  resetToDefaults: () => Promise<boolean>;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const SETTINGS_DOC_ID = "site-settings";
  const SETTINGS_COLLECTION = "settings";

  // Fetch settings from Firestore
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!isFirebaseInitialized()) {
        console.warn("Firebase not initialized, using default settings");
        setSettings(defaultSiteConfig);
        return;
      }

      const settings = await safeFirestoreOperation<SiteSettings | null>(
        async () => {
          const docRef = doc(db!, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            return docSnap.data() as SiteSettings;
          } else {
            // If settings don't exist in Firestore, initialize with defaults
            await setDoc(docRef, {
              ...defaultSiteConfig,
              updatedAt: new Date(),
            });
            return defaultSiteConfig;
          }
        },
        null,
      );

      if (settings) {
        // Merge with defaults to ensure all fields exist
        const mergedSettings = {
          ...defaultSiteConfig,
          ...settings,
          contact: {
            ...defaultSiteConfig.contact,
            ...(settings.contact || {}),
          },
          social: {
            ...defaultSiteConfig.social,
            ...(settings.social || {}),
          },
          ordering: {
            ...defaultSiteConfig.ordering,
            ...(settings.ordering || {}),
          },
          maps: {
            ...defaultSiteConfig.maps,
            ...(settings.maps || {}),
          },
          seo: {
            ...defaultSiteConfig.seo,
            ...(settings.seo || {}),
          },
          settings: {
            ...defaultSiteConfig.settings,
            ...(settings.settings || {}),
          },
        };

        setSettings(mergedSettings);
      } else {
        setSettings(defaultSiteConfig);
      }
    } catch (err: any) {
      console.error("Error fetching site settings:", err);
      setError(`Không thể tải cài đặt từ máy chủ: ${err.message}`);
      // On error, fall back to default settings
      setSettings(defaultSiteConfig);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update settings in Firestore
  const updateSettings = async (
    newSettings: Partial<SiteSettings>,
  ): Promise<boolean> => {
    try {
      if (!isFirebaseInitialized()) {
        const errorMsg = "Firebase không được khởi tạo";
        console.error(`[useSettings] ${errorMsg}`);
        setError(errorMsg);
        return false;
      }

      console.log("[useSettings] Attempting to update settings:", newSettings);

      const docRef = doc(db!, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
      console.log(
        "[useSettings] Document reference created for:",
        SETTINGS_COLLECTION,
        SETTINGS_DOC_ID,
      );

      const docSnap = await getDoc(docRef);
      console.log("[useSettings] Document exists:", docSnap.exists());

      if (docSnap.exists()) {
        // Update existing settings
        console.log("[useSettings] Updating existing document with:", {
          ...newSettings,
          updatedAt: new Date(),
        });

        await updateDoc(docRef, {
          ...newSettings,
          updatedAt: new Date(),
        });

        console.log("[useSettings] Document successfully updated");
      } else {
        // Create new settings document
        console.log("[useSettings] Creating new document with:", {
          ...defaultSiteConfig,
          ...newSettings,
          updatedAt: new Date(),
        });

        await setDoc(docRef, {
          ...defaultSiteConfig,
          ...newSettings,
          updatedAt: new Date(),
        });

        console.log("[useSettings] Document successfully created");
      }

      // Update local state
      setSettings((prev) => ({
        ...prev,
        ...newSettings,
        updatedAt: new Date(),
      }));

      console.log("[useSettings] Local state updated successfully");
      return true;
    } catch (err: any) {
      console.error("[useSettings] Error updating site settings:", err);
      console.error("[useSettings] Error code:", err.code);
      console.error("[useSettings] Error message:", err.message);
      console.error("[useSettings] Error stack:", err.stack);

      // Check for specific Firestore errors
      if (err.code) {
        if (err.code === "permission-denied") {
          setError(
            `Không đủ quyền để cập nhật cài đặt. Vui lòng kiểm tra quyền truy cập.`,
          );
        } else if (err.code === "unavailable") {
          setError(
            `Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.`,
          );
        } else {
          setError(`Không thể cập nhật cài đặt: ${err.code} - ${err.message}`);
        }
      } else {
        setError(`Không thể cập nhật cài đặt: ${err.message}`);
      }

      return false;
    }
  };

  // Reset settings to defaults
  const resetToDefaults = async (): Promise<boolean> => {
    try {
      if (!isFirebaseInitialized()) {
        setError("Firebase không được khởi tạo");
        return false;
      }

      const docRef = doc(db!, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
      await setDoc(docRef, {
        ...defaultSiteConfig,
        updatedAt: new Date(),
      });

      // Update local state
      setSettings(defaultSiteConfig);
      return true;
    } catch (err: any) {
      console.error("Error resetting site settings:", err);
      setError(`Không thể khôi phục cài đặt mặc định: ${err.message}`);
      return false;
    }
  };

  // Load settings on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    resetToDefaults,
  };
}
