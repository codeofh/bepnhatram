import { useState, useEffect, useCallback } from "react";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  DocumentReference,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { isFirebaseInitialized } from "@/lib/firebase";
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
  updatedAt?: Timestamp | Date;
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

      if (!db) {
        console.warn("Firestore not initialized, using default settings");
        setSettings(defaultSiteConfig);
        return;
      }

      const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const firestoreSettings = docSnap.data() as SiteSettings;
        // Merge with defaults to ensure all fields exist
        const mergedSettings = mergeWithDefaults(firestoreSettings);
        setSettings(mergedSettings);
      } else {
        // If settings don't exist in Firestore, initialize with defaults
        try {
          await setDoc(docRef, {
            ...defaultSiteConfig,
            updatedAt: serverTimestamp(),
          });
        } catch (initError) {
          console.error("Error initializing settings document:", initError);
          // Continue even if initialization fails
        }
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

  // Helper function to merge settings with defaults
  const mergeWithDefaults = (
    userSettings: Partial<SiteSettings>,
  ): SiteSettings => {
    // Create a deep copy of the default settings
    const result = JSON.parse(
      JSON.stringify(defaultSiteConfig),
    ) as SiteSettings;

    // Merge top-level properties
    Object.keys(userSettings).forEach((key) => {
      const settingKey = key as keyof SiteSettings;
      const value = userSettings[settingKey];

      if (value !== undefined && value !== null) {
        if (
          typeof value === "object" &&
          !Array.isArray(value) &&
          value !== null
        ) {
          // For nested objects, merge with default values
          result[settingKey] = {
            ...result[settingKey],
            ...value,
          };
        } else {
          // For primitive values, replace entirely
          (result as any)[settingKey] = value;
        }
      }
    });

    return result;
  };

  // Clean settings object for Firestore (remove undefined values, handle nested objects)
  const cleanSettingsForFirestore = (
    data: Partial<SiteSettings>,
  ): Record<string, any> => {
    const cleaned: Record<string, any> = {};

    Object.entries(data).forEach(([key, value]) => {
      // Skip undefined values and special properties
      if (value === undefined || key === "__proto__" || key === "constructor") {
        return;
      }

      if (value === null) {
        cleaned[key] = null;
        return;
      }

      if (typeof value === "object" && !Array.isArray(value)) {
        // Handle nested objects
        const nestedCleaned: Record<string, any> = {};
        let hasValidProperties = false;

        Object.entries(value).forEach(([nestedKey, nestedValue]) => {
          if (
            nestedValue !== undefined &&
            nestedKey !== "__proto__" &&
            nestedKey !== "constructor"
          ) {
            nestedCleaned[nestedKey] = nestedValue;
            hasValidProperties = true;
          }
        });

        // Only add the nested object if it has valid properties
        if (hasValidProperties) {
          cleaned[key] = nestedCleaned;
        }
      } else {
        // Handle primitive values and arrays
        cleaned[key] = value;
      }
    });

    return cleaned;
  };

  // Update settings in Firestore
  const updateSettings = async (
    newSettings: Partial<SiteSettings>,
  ): Promise<boolean> => {
    setError(null);

    try {
      // Validate Firebase initialization
      if (typeof isFirebaseInitialized !== "function") {
        const errorMsg = "Firebase initialization check function is missing";
        console.error(`[useSettings] ${errorMsg}`);
        setError(errorMsg);
        return false;
      }

      if (!isFirebaseInitialized()) {
        const errorMsg = "Firebase không được khởi tạo";
        console.error(`[useSettings] ${errorMsg}`);
        setError(errorMsg);
        return false;
      }

      if (!db) {
        const errorMsg = "Firestore instance is not available";
        console.error(`[useSettings] ${errorMsg}`);
        setError(errorMsg);
        return false;
      }

      // Prepare clean data for Firestore
      const cleanedSettings = cleanSettingsForFirestore(newSettings);
      console.log(
        "[useSettings] Cleaned settings for update:",
        cleanedSettings,
      );

      // Add timestamp
      cleanedSettings.updatedAt = serverTimestamp();

      // Get document reference
      const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);

      // Use single operation with merge option for efficiency
      await setDoc(docRef, cleanedSettings, { merge: true });

      // Update local state with the new settings
      setSettings((prev) =>
        mergeWithDefaults({ ...prev, ...newSettings, updatedAt: new Date() }),
      );

      console.log("[useSettings] Settings updated successfully");
      return true;
    } catch (err: any) {
      // Handle specific Firestore errors
      let errorMsg = "Không thể cập nhật cài đặt";

      if (err.code === "permission-denied") {
        errorMsg =
          "Không đủ quyền để cập nhật cài đặt. Vui lòng kiểm tra quyền truy cập.";
      } else if (err.code === "unavailable") {
        errorMsg =
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
      } else if (err.code === "invalid-argument") {
        errorMsg =
          "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin nhập vào.";
      } else if (err.message) {
        errorMsg = `${errorMsg}: ${err.message}`;
      }

      console.error("[useSettings] Error updating settings:", err);
      console.error("[useSettings] Error code:", err.code);
      console.error("[useSettings] Error message:", err.message);

      setError(errorMsg);
      return false;
    }
  };

  // Reset settings to defaults
  const resetToDefaults = async (): Promise<boolean> => {
    setError(null);

    try {
      if (!isFirebaseInitialized()) {
        const errorMsg = "Firebase không được khởi tạo";
        console.error(`[useSettings] ${errorMsg}`);
        setError(errorMsg);
        return false;
      }

      if (!db) {
        const errorMsg = "Firestore instance is not available";
        console.error(`[useSettings] ${errorMsg}`);
        setError(errorMsg);
        return false;
      }

      const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);

      // Add server timestamp to default settings
      const defaultWithTimestamp = {
        ...defaultSiteConfig,
        updatedAt: serverTimestamp(),
      };

      // Replace the entire document with default settings
      await setDoc(docRef, defaultWithTimestamp);

      // Update local state
      setSettings({ ...defaultSiteConfig, updatedAt: new Date() });

      console.log("[useSettings] Settings reset to defaults successfully");
      return true;
    } catch (err: any) {
      let errorMsg = "Không thể khôi phục cài đặt mặc định";

      if (err.code === "permission-denied") {
        errorMsg =
          "Không đủ quyền để khôi phục cài đặt. Vui lòng kiểm tra quyền truy cập.";
      } else if (err.code === "unavailable") {
        errorMsg =
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
      } else if (err.message) {
        errorMsg = `${errorMsg}: ${err.message}`;
      }

      console.error("[useSettings] Error resetting settings:", err);
      setError(errorMsg);
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
