import { useState, useEffect } from 'react';
import { collection, doc, getDocs, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirestore } from './useFirestore';

export interface Category {
  id: string;
  name: string;
  displayName: string;
  displayOrder: number;
  icon?: string;
  createdAt?: number; // Timestamp in milliseconds
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getCollection, setDocument, deleteDocument, updateDocument } = useFirestore();

  const COLLECTION_NAME = 'categories';

  // Fetch all categories
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const categoriesData = await getCollection<Category>(COLLECTION_NAME);
      
      // Sort by createdAt (if available), otherwise fall back to displayOrder
      const sortedCategories = categoriesData.sort((a, b) => {
        // If both have createdAt, sort by that
        if (a.createdAt && b.createdAt) {
          return a.createdAt - b.createdAt;
        }
        // If only one has createdAt, put the one without createdAt first
        if (a.createdAt && !b.createdAt) return 1;
        if (!a.createdAt && b.createdAt) return -1;
        // Fall back to displayOrder if no createdAt
        return a.displayOrder - b.displayOrder;
      });
      
      // If no categories exist, create default ones
      if (sortedCategories.length === 0) {
        const now = Date.now();
        const defaultCategories: Category[] = [
          { id: "all", name: "Tất cả", displayName: "Tất cả", displayOrder: 0, createdAt: now },
          { id: "special", name: "special", displayName: "Đặc biệt", displayOrder: 1, createdAt: now + 1 },
          { id: "main", name: "main", displayName: "Món chính", displayOrder: 2, createdAt: now + 2 },
          { id: "chicken", name: "chicken", displayName: "Gà ủ muối", displayOrder: 3, createdAt: now + 3 },
          { id: "chicken-feet", name: "chicken-feet", displayName: "Chân gà", displayOrder: 4, createdAt: now + 4 },
          { id: "drinks", name: "drinks", displayName: "Đồ uống", displayOrder: 5, createdAt: now + 5 },
        ];
        
        // Save default categories to Firestore
        await Promise.all(
          defaultCategories.map(category => 
            setDocument(COLLECTION_NAME, category.id, category)
          )
        );
        
        setCategories(defaultCategories);
      } else {
        setCategories(sortedCategories);
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError('Không thể tải danh mục. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Add a new category
  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      // Always generate ID from displayName
      const id = category.displayName.toLowerCase()
        .replace(/đ/g, 'd')
        .replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, 'a')
        .replace(/[éèẻẽẹêếềểễệ]/g, 'e')
        .replace(/[íìỉĩị]/g, 'i')
        .replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o')
        .replace(/[úùủũụưứừửữự]/g, 'u')
        .replace(/[ýỳỷỹỵ]/g, 'y')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
      
      // Create a clean object without undefined values
      const cleanCategory: Record<string, any> = {
        id,
        name: category.name || id,
        displayName: category.displayName,
        displayOrder: category.displayOrder,
        createdAt: Date.now(), // Add timestamp for creation time
      };
      
      // Only add icon if it exists and is not undefined
      if (category.icon) {
        cleanCategory.icon = category.icon;
      }
      
      const newCategory = cleanCategory as Category;
      
      await setDocument(COLLECTION_NAME, id, newCategory);
      
      // Update local state
      setCategories(prev => [...prev, newCategory].sort((a, b) => {
        // If both have createdAt, sort by that
        if (a.createdAt && b.createdAt) {
          return a.createdAt - b.createdAt;
        }
        // If only one has createdAt, put the one without createdAt first
        if (a.createdAt && !b.createdAt) return 1;
        if (!a.createdAt && b.createdAt) return -1;
        // Fall back to displayOrder if no createdAt
        return a.displayOrder - b.displayOrder;
      }));
      
      return { success: true, category: newCategory };
    } catch (err: any) {
      console.error('Error adding category:', err);
      return { success: false, error: err.message || 'Không thể thêm danh mục' };
    }
  };

  // Update an existing category
  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    try {
      // Don't allow changing ID or name of "all" category
      const isDefault = id === "all";
      
      // Create a clean object without undefined values
      const cleanData: Record<string, any> = {};
      
      // Add only defined values
      if (categoryData.displayName !== undefined) {
        cleanData.displayName = categoryData.displayName;
      }
      
      if (categoryData.displayOrder !== undefined) {
        cleanData.displayOrder = categoryData.displayOrder;
      }
      
      // Handle name and id specially for the "all" category
      if (isDefault) {
        cleanData.id = "all";
        cleanData.name = "Tất cả";
      } else if (categoryData.name !== undefined) {
        cleanData.name = categoryData.name;
      }
      
      // Only add icon if it exists and is not undefined
      if (categoryData.icon) {
        cleanData.icon = categoryData.icon;
      }
      
      await updateDocument(COLLECTION_NAME, id, cleanData);
      
      // Update local state
      setCategories(prev => 
        prev.map(c => c.id === id ? { ...c, ...cleanData } : c)
          .sort((a, b) => {
            // If both have createdAt, sort by that
            if (a.createdAt && b.createdAt) {
              return a.createdAt - b.createdAt;
            }
            // If only one has createdAt, put the one without createdAt first
            if (a.createdAt && !b.createdAt) return 1;
            if (!a.createdAt && b.createdAt) return -1;
            // Fall back to displayOrder if no createdAt
            return a.displayOrder - b.displayOrder;
          })
      );
      
      return { success: true };
    } catch (err: any) {
      console.error('Error updating category:', err);
      return { success: false, error: err.message || 'Không thể cập nhật danh mục' };
    }
  };

  // Delete a category
  const deleteCategory = async (id: string) => {
    try {
      if (id === "all") {
        return { success: false, error: 'Không thể xóa danh mục mặc định!' };
      }
      
      await deleteDocument(COLLECTION_NAME, id);
      
      // Update local state
      setCategories(prev => prev.filter(c => c.id !== id));
      
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting category:', err);
      return { success: false, error: err.message || 'Không thể xóa danh mục' };
    }
  };

  // Update category order
  const updateCategoryOrder = async (categories: Category[]) => {
    try {
      // Update all categories with new display orders
      await Promise.all(
        categories.map(category => 
          updateDocument(COLLECTION_NAME, category.id, { displayOrder: category.displayOrder })
        )
      );
      
      // Update local state
      setCategories(categories);
      
      return { success: true };
    } catch (err: any) {
      console.error('Error updating category order:', err);
      return { success: false, error: err.message || 'Không thể cập nhật thứ tự danh mục' };
    }
  };

  // Load categories on initial mount
  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    updateCategoryOrder,
  };
};
