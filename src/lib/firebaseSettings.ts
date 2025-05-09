import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Firestore,
} from "firebase/firestore";
import { db, isFirebaseInitialized } from "@/lib/firebase";
import { siteConfig as defaultSiteConfig } from "@/config/siteConfig";

// Type for site settings
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
  updatedAt?: any;
}

const SETTINGS_DOC_ID = "site-settings";
const SETTINGS_COLLECTION = "settings";

/**
 * Clean settings object for Firestore (remove undefined values, handle nested objects)
 */
function cleanSettingsForFirestore(
  data: Partial<SiteSettings>,
): Record<string, any> {
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
}

/**
 * Update site settings directly to Firebase
 */
export async function updateSiteSettings(
  newSettings: Partial<SiteSettings>,
): Promise<{
  success: boolean;
  error?: string;
}> {
  console.log("[firebaseSettings] Starting direct settings update");

  try {
    // Check Firebase initialization
    if (typeof isFirebaseInitialized !== "function") {
      console.error(
        "[firebaseSettings] isFirebaseInitialized is not a function",
      );
      return {
        success: false,
        error: "Firebase initialization check function is missing",
      };
    }

    if (!isFirebaseInitialized()) {
      console.error("[firebaseSettings] Firebase is not initialized");
      return {
        success: false,
        error: "Firebase không được khởi tạo",
      };
    }

    if (!db) {
      console.error("[firebaseSettings] Firestore instance is null");
      return {
        success: false,
        error: "Firestore instance is not available",
      };
    }

    // Clean data for Firestore
    const cleanSettings = cleanSettingsForFirestore(newSettings);
    console.log("[firebaseSettings] Cleaned settings:", cleanSettings);

    // Add timestamp
    cleanSettings.updatedAt = serverTimestamp();

    // Get document reference
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);

    // Use merge to preserve existing data
    await setDoc(docRef, cleanSettings, { merge: true });

    console.log("[firebaseSettings] Settings successfully updated");
    return { success: true };
  } catch (err: any) {
    console.error("[firebaseSettings] Error updating settings:", err);

    // Handle specific Firebase errors
    let errorMessage = "Không thể cập nhật cài đặt";

    if (err.code === "permission-denied") {
      errorMessage =
        "Không đủ quyền để cập nhật cài đặt. Vui lòng kiểm tra quyền truy cập.";
    } else if (err.code === "unavailable") {
      errorMessage =
        "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
    } else if (err.code === "invalid-argument") {
      errorMessage =
        "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin nhập vào.";
    } else if (err.message) {
      errorMessage = `${errorMessage}: ${err.message}`;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get current settings from Firebase
 */
/**
 * Ensure all nested objects exist in settings
 */
function ensureCompleteSettings(settings: Partial<SiteSettings>): SiteSettings {
  return {
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
}

export async function getSiteSettings(): Promise<{
  settings: SiteSettings;
  error?: string;
}> {
  try {
    if (!isFirebaseInitialized() || !db) {
      console.warn(
        "[firebaseSettings] Firebase not initialized, using default settings",
      );
      return { settings: defaultSiteConfig };
    }

    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Get settings data and ensure all nested objects exist
      const settingsData = docSnap.data();
      const completeSettings = ensureCompleteSettings(
        settingsData as Partial<SiteSettings>,
      );

      console.log(
        "[firebaseSettings] Settings loaded successfully with nested objects",
      );
      return { settings: completeSettings };
    } else {
      // Create settings document with defaults if it doesn't exist
      try {
        console.log("[firebaseSettings] Creating default settings document");
        await setDoc(docRef, {
          ...defaultSiteConfig,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.error(
          "[firebaseSettings] Error creating default settings:",
          err,
        );
      }

      return { settings: defaultSiteConfig };
    }
  } catch (err: any) {
    console.error("[firebaseSettings] Error getting settings:", err);
    return {
      settings: defaultSiteConfig,
      error: `Không thể tải cài đặt: ${err.message || "Lỗi không xác định"}`,
    };
  }
}

/**
 * Reset settings to defaults
 */
export async function resetSiteSettings(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!isFirebaseInitialized() || !db) {
      return {
        success: false,
        error: "Firebase không được khởi tạo",
      };
    }

    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);

    await setDoc(docRef, {
      ...defaultSiteConfig,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (err: any) {
    console.error("[firebaseSettings] Error resetting settings:", err);

    return {
      success: false,
      error: `Không thể khôi phục cài đặt mặc định: ${err.message || "Lỗi không xác định"}`,
    };
  }
}
