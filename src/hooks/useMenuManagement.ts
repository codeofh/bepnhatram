import { useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { useToastContext } from "@/contexts/ToastContext";
import { MenuItem, SizeOption } from "@/data/menuItems";
import { sampleMenuItems } from "@/data/sampleMenu";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  DocumentData,
  QueryConstraint,
  writeBatch,
} from "firebase/firestore";

export function useMenuManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useToastContext();

  const MENU_COLLECTION = "menu";

  /**
   * Import sample menu items
   */
  const importSampleMenuItems = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      if (!db) {
        throw new Error("Firestore is not initialized");
      }

      // Check if collection is empty
      const snapshot = await getDocs(collection(db, MENU_COLLECTION));

      if (snapshot.size > 0) {
        showSuccess("Dữ liệu menu đã tồn tại, không cần nhập lại!");
        return true;
      }

      // Create a batch
      let currentBatch = writeBatch(db);
      let operationCount = 0;
      const MAX_OPERATIONS = 450; // Using a lower number than 500 for safety

      // Add all sample items
      for (const item of sampleMenuItems) {
        // Create a document with the same ID as in the static data
        const newDocRef = doc(db, MENU_COLLECTION, item.id);

        // Add timestamps
        const itemToSave = {
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        currentBatch.set(newDocRef, itemToSave);

        operationCount++;

        // If we reach the maximum operations per batch, commit this batch and start a new one
        if (operationCount >= MAX_OPERATIONS) {
          await currentBatch.commit();
          currentBatch = writeBatch(db);
          operationCount = 0;
        }
      }

      // Commit any remaining operations
      if (operationCount > 0) {
        await currentBatch.commit();
      }

      showSuccess("Đã nhập dữ liệu menu mẫu thành công!");
      return true;
    } catch (err: any) {
      console.error("Error importing sample menu items:", err);
      setError(`Could not import sample menu items: ${err.message}`);
      showError("Có lỗi xảy ra khi nhập dữ liệu menu mẫu!");
      return false;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  /**
   * Get all menu items with pagination
   */
  const getAllMenuItems = useCallback(
    async (
      page: number = 1,
      itemsPerPage: number = 20,
      sortField: keyof MenuItem = "displayOrder",
      sortDirection: "asc" | "desc" = "asc",
    ): Promise<{
      items: MenuItem[];
      totalItems: number;
      totalPages: number;
    }> => {
      setLoading(true);
      setError(null);

      try {
        if (!db) {
          throw new Error("Firestore is not initialized");
        }

        // First get the total count (this is a separate query as Firestore doesn't support
        // getting count and paginated data in one query)
        const countSnapshot = await getDocs(collection(db, MENU_COLLECTION));
        const totalItems = countSnapshot.size;

        // Calculate total pages
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        // Ensure current page is valid
        const validPage = Math.max(1, Math.min(page, totalPages || 1));

        // Get items for the current page
        // Note: Firestore doesn't have native pagination with offset,
        // so we get all items and then slice them (not efficient for large datasets)
        const menuQuery = query(
          collection(db, MENU_COLLECTION),
          orderBy(sortField.toString(), sortDirection),
        );

        const snapshot = await getDocs(menuQuery);

        if (snapshot.empty) {
          return { items: [], totalItems: 0, totalPages: 0 };
        }

        // Convert all items to our format
        const allItems = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            price: data.price || 0,
            rating: data.rating || 4,
            displayOrder: data.displayOrder || 0,
          } as MenuItem;
        });

        // Calculate slice indices for the current page
        const startIndex = (validPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        // Slice the items for the current page
        const pagedItems = allItems.slice(startIndex, endIndex);

        return {
          items: pagedItems,
          totalItems,
          totalPages,
        };
      } catch (err: any) {
        console.error("Error fetching menu items:", err);
        setError(`Could not fetch menu items: ${err.message}`);
        showError("Không thể lấy danh sách món ăn, vui lòng thử lại sau!");
        return {
          items: [],
          totalItems: 0,
          totalPages: 0,
        };
      } finally {
        setLoading(false);
      }
    },
    [showError],
  );

  /**
   * Get menu items by category
   */
  const getMenuItemsByCategory = useCallback(
    async (category: string): Promise<MenuItem[]> => {
      setLoading(true);
      setError(null);

      try {
        if (!db) {
          throw new Error("Firestore is not initialized");
        }

        const menuQuery = query(
          collection(db, MENU_COLLECTION),
          where("category", "==", category),
          orderBy("displayOrder", "asc"),
        );

        const snapshot = await getDocs(menuQuery);

        if (snapshot.empty) {
          return [];
        }

        const menuItems = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            price: data.price || 0,
            rating: data.rating || 4,
          } as MenuItem;
        });

        return menuItems;
      } catch (err: any) {
        console.error(
          `Error fetching menu items for category ${category}:`,
          err,
        );
        setError(`Could not fetch menu items: ${err.message}`);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Get a single menu item by ID
   */
  const getMenuItem = useCallback(
    async (itemId: string): Promise<MenuItem | null> => {
      setLoading(true);
      setError(null);

      try {
        if (!db) {
          throw new Error("Firestore is not initialized");
        }

        const docRef = doc(db, MENU_COLLECTION, itemId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError(`Item not found: ${itemId}`);
          return null;
        }

        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          price: data.price || 0,
          rating: data.rating || 4,
          displayOrder: data.displayOrder || 0,
        } as MenuItem;
      } catch (err: any) {
        console.error(`Error fetching menu item ${itemId}:`, err);
        setError(`Could not fetch menu item: ${err.message}`);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Add a new menu item
   */
  const addMenuItem = useCallback(
    async (item: Omit<MenuItem, "id">): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        if (!db) {
          throw new Error("Firestore is not initialized");
        }

        // Create a new document reference
        const newDocRef = doc(collection(db, MENU_COLLECTION));

        // Prepare the data
        const newItem = {
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        // Save to Firestore
        await setDoc(newDocRef, newItem);

        showSuccess("Đã thêm món ăn mới thành công!");
        return newDocRef.id;
      } catch (err: any) {
        console.error("Error adding menu item:", err);
        setError(`Could not add menu item: ${err.message}`);
        showError("Có lỗi xảy ra khi lưu món ăn!");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  /**
   * Update an existing menu item
   */
  const updateMenuItem = useCallback(
    async (id: string, item: Partial<MenuItem>): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        if (!db) {
          throw new Error("Firestore is not initialized");
        }

        const docRef = doc(db, MENU_COLLECTION, id);

        // Check if document exists
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          throw new Error(`Menu item with ID ${id} not found`);
        }

        // Prepare the update data
        const updateData = {
          ...item,
          updatedAt: serverTimestamp(),
        };

        // Update the document
        await updateDoc(docRef, updateData);

        showSuccess("Đã cập nhật món ăn thành công!");
        return true;
      } catch (err: any) {
        console.error(`Error updating menu item ${id}:`, err);
        setError(`Could not update menu item: ${err.message}`);
        showError("Có lỗi xảy ra khi cập nhật món ăn!");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  /**
   * Delete a menu item
   */
  const deleteMenuItem = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        if (!db) {
          throw new Error("Firestore is not initialized");
        }

        const docRef = doc(db, MENU_COLLECTION, id);

        // Delete the document
        await deleteDoc(docRef);

        showSuccess("Đã xóa món ăn thành công!");
        return true;
      } catch (err: any) {
        console.error(`Error deleting menu item ${id}:`, err);
        setError(`Could not delete menu item: ${err.message}`);
        showError("Có lỗi xảy ra khi xóa món ăn!");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  /**
   * Search for menu items by name
   */
  const searchMenuItems = useCallback(
    async (searchTerm: string): Promise<MenuItem[]> => {
      // Note: Firebase doesn't support native text search
      // For a real app, consider using Algolia or other search services
      // This is a simple implementation that just filters results client-side

      try {
        const allItems = await getAllMenuItems();

        if (!searchTerm || searchTerm.trim() === "") {
          return allItems.items;
        }

        const normalizedSearchTerm = searchTerm.toLowerCase().trim();
        return allItems.items.filter(
          (item) =>
            item.name.toLowerCase().includes(normalizedSearchTerm) ||
            item.description.toLowerCase().includes(normalizedSearchTerm),
        );
      } catch (err: any) {
        console.error(`Error searching menu items:`, err);
        setError(`Could not search menu items: ${err.message}`);
        return [];
      }
    },
    [getAllMenuItems],
  );

  /**
   * Filter menu items by category
   */
  const filterMenuItems = useCallback(
    async (filters: {
      category?: string;
      priceMin?: number;
      priceMax?: number;
      searchTerm?: string;
    }): Promise<MenuItem[]> => {
      try {
        let items: MenuItem[] = [];

        // If we have a category filter, use the specific query
        if (filters.category && filters.category !== "all") {
          items = await getMenuItemsByCategory(filters.category);
        } else {
          // Otherwise get all items
          items = (await getAllMenuItems()).items;
        }

        // Apply search filter if provided
        if (filters.searchTerm && filters.searchTerm.trim() !== "") {
          const term = filters.searchTerm.toLowerCase().trim();
          items = items.filter(
            (item) =>
              item.name.toLowerCase().includes(term) ||
              item.description.toLowerCase().includes(term),
          );
        }

        // Apply price filters if provided
        if (typeof filters.priceMin === "number") {
          items = items.filter((item) => item.price >= filters.priceMin!);
        }

        if (typeof filters.priceMax === "number") {
          items = items.filter((item) => item.price <= filters.priceMax!);
        }

        return items;
      } catch (err: any) {
        console.error(`Error filtering menu items:`, err);
        setError(`Could not filter menu items: ${err.message}`);
        return [];
      }
    },
    [getAllMenuItems, getMenuItemsByCategory],
  );

  /**
   * Initialize the menu collection with sample data if it's empty
   */
  const initializeMenuCollection = useCallback(
    async (sampleData: MenuItem[]): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        if (!db) {
          throw new Error("Firestore is not initialized");
        }

        // Check if collection is empty
        const snapshot = await getDocs(collection(db, MENU_COLLECTION));

        if (!snapshot.empty) {
          showSuccess("Dữ liệu menu đã tồn tại, không cần khởi tạo lại!");
          return true;
        }

        // Create a batch
        let currentBatch = writeBatch(db);
        let operationCount = 0;
        const MAX_OPERATIONS = 450; // Using a lower number than 500 for safety

        // Add all sample items
        for (const item of sampleData) {
          // Create a document with the same ID as in the static data
          const newDocRef = doc(db, MENU_COLLECTION, item.id);

          // Prepare the data to save, excluding the ID which is already in the reference
          const { id, ...itemWithoutId } = item;

          // Add timestamps
          currentBatch.set(newDocRef, {
            ...itemWithoutId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          operationCount++;

          // If we reach the maximum operations per batch, commit this batch and start a new one
          if (operationCount >= MAX_OPERATIONS) {
            await currentBatch.commit();
            currentBatch = writeBatch(db);
            operationCount = 0;
          }
        }

        // Commit any remaining operations
        if (operationCount > 0) {
          await currentBatch.commit();
        }

        showSuccess("Đã khởi tạo dữ liệu menu mẫu thành công!");
        return true;
      } catch (err: any) {
        console.error("Error initializing menu collection:", err);
        setError(`Could not initialize menu collection: ${err.message}`);
        showError("Có lỗi xảy ra khi khởi tạo dữ liệu menu mẫu!");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  return {
    getAllMenuItems,
    getMenuItemsByCategory,
    getMenuItem,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    searchMenuItems,
    filterMenuItems,
    initializeMenuCollection,
    importSampleMenuItems,
    loading,
    error,
  };
}
