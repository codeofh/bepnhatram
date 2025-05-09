import { useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { useToastContext } from "@/contexts/ToastContext";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

export interface SliderItem {
  id: string;
  image: string;
  title: string;
  description: string;
  cta: string;
  ctaLink?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export function useSliderManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useToastContext();

  const SLIDER_COLLECTION = "sliders";

  /**
   * Get all slider items
   */
  const getAllSliders = useCallback(async (): Promise<SliderItem[]> => {
    setLoading(true);
    setError(null);

    try {
      if (!db) {
        throw new Error("Firestore is not initialized");
      }

      const slidersQuery = query(
        collection(db, SLIDER_COLLECTION),
        orderBy("displayOrder", "asc"),
      );

      const snapshot = await getDocs(slidersQuery);

      if (snapshot.empty) {
        return [];
      }

      const sliders = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          displayOrder: data.displayOrder || 0,
        } as SliderItem;
      });

      return sliders;
    } catch (err: any) {
      console.error("Error fetching sliders:", err);
      setError(`Could not fetch sliders: ${err.message}`);
      showError("Không thể lấy danh sách slider, vui lòng thử lại sau!");
      return [];
    } finally {
      setLoading(false);
    }
  }, [showError]);

  /**
   * Get active sliders for frontend
   */
  const getActiveSliders = useCallback(async (): Promise<SliderItem[]> => {
    setLoading(true);
    setError(null);

    try {
      if (!db) {
        throw new Error("Firestore is not initialized");
      }

      const slidersQuery = query(
        collection(db, SLIDER_COLLECTION),
        orderBy("displayOrder", "asc"),
      );

      const snapshot = await getDocs(slidersQuery);

      if (snapshot.empty) {
        return [];
      }

      const sliders = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            displayOrder: data.displayOrder || 0,
          } as SliderItem;
        })
        .filter((slider) => slider.isActive);

      return sliders;
    } catch (err: any) {
      console.error("Error fetching active sliders:", err);
      setError(`Could not fetch active sliders: ${err.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get a single slider by ID
   */
  const getSlider = useCallback(
    async (sliderId: string): Promise<SliderItem | null> => {
      setLoading(true);
      setError(null);

      try {
        if (!db) {
          throw new Error("Firestore is not initialized");
        }

        const docRef = doc(db, SLIDER_COLLECTION, sliderId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError(`Slider not found: ${sliderId}`);
          return null;
        }

        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          displayOrder: data.displayOrder || 0,
        } as SliderItem;
      } catch (err: any) {
        console.error(`Error fetching slider ${sliderId}:`, err);
        setError(`Could not fetch slider: ${err.message}`);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Add a new slider
   */
  const addSlider = useCallback(
    async (slider: Omit<SliderItem, "id">): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        if (!db) {
          throw new Error("Firestore is not initialized");
        }

        // Create a new document reference
        const newDocRef = doc(collection(db, SLIDER_COLLECTION));

        // Prepare the data
        const newSlider = {
          ...slider,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        // Save to Firestore
        await setDoc(newDocRef, newSlider);

        showSuccess("Đã thêm slider mới thành công!");
        return newDocRef.id;
      } catch (err: any) {
        console.error("Error adding slider:", err);
        setError(`Could not add slider: ${err.message}`);
        showError("Có lỗi xảy ra khi lưu slider!");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  /**
   * Update an existing slider
   */
  const updateSlider = useCallback(
    async (id: string, slider: Partial<SliderItem>): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        if (!db) {
          throw new Error("Firestore is not initialized");
        }

        const docRef = doc(db, SLIDER_COLLECTION, id);

        // Check if document exists
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          throw new Error(`Slider with ID ${id} not found`);
        }

        // Prepare the update data
        const updateData = {
          ...slider,
          updatedAt: serverTimestamp(),
        };

        // Update the document
        await updateDoc(docRef, updateData);

        showSuccess("Đã cập nhật slider thành công!");
        return true;
      } catch (err: any) {
        console.error(`Error updating slider ${id}:`, err);
        setError(`Could not update slider: ${err.message}`);
        showError("Có lỗi xảy ra khi cập nhật slider!");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  /**
   * Delete a slider
   */
  const deleteSlider = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        if (!db) {
          throw new Error("Firestore is not initialized");
        }

        const docRef = doc(db, SLIDER_COLLECTION, id);

        // Delete the document
        await deleteDoc(docRef);

        showSuccess("Đã xóa slider thành công!");
        return true;
      } catch (err: any) {
        console.error(`Error deleting slider ${id}:`, err);
        setError(`Could not delete slider: ${err.message}`);
        showError("Có lỗi xảy ra khi xóa slider!");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  /**
   * Update display order of sliders
   */
  const updateSlidersOrder = useCallback(
    async (sliders: SliderItem[]): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        if (!db) {
          throw new Error("Firestore is not initialized");
        }

        const batch = writeBatch(db);

        sliders.forEach((slider, index) => {
          const docRef = doc(db, SLIDER_COLLECTION, slider.id);
          batch.update(docRef, {
            displayOrder: index,
            updatedAt: serverTimestamp(),
          });
        });

        await batch.commit();

        showSuccess("Đã cập nhật thứ tự slider thành công!");
        return true;
      } catch (err: any) {
        console.error("Error updating sliders order:", err);
        setError(`Could not update sliders order: ${err.message}`);
        showError("Có lỗi xảy ra khi cập nhật thứ tự slider!");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  /**
   * Initialize the sliders collection with default data
   */
  const initializeDefaultSliders = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      if (!db) {
        throw new Error("Firestore is not initialized");
      }

      // Check if collection is empty
      const snapshot = await getDocs(collection(db, SLIDER_COLLECTION));

      if (!snapshot.empty) {
        showSuccess("Dữ liệu slider đã tồn tại, không cần khởi tạo lại!");
        return true;
      }

      // Default sliders data
      const defaultSliders = [
        {
          id: "slide1",
          image:
            "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
          title: "Bò Lúc Lắc Khoai Tây",
          description:
            "Thịt bò thăn mềm xào cùng khoai tây và rau củ, món ăn đậm đà đặc trưng",
          cta: "Đặt món ngay",
          ctaLink: "/menu",
          displayOrder: 0,
          isActive: true,
        },
        {
          id: "slide2",
          image:
            "https://images.unsplash.com/photo-1598866594230-a7c12756260f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
          title: "Mì Ý Sốt Thịt Băm",
          description:
            "Mì Ý với sốt thịt bò băm đậm đà, phô mai parmesan và các loại rau thơm tươi ngon",
          cta: "Xem thực đơn",
          ctaLink: "/menu",
          displayOrder: 1,
          isActive: true,
        },
        {
          id: "slide3",
          image:
            "https://images.unsplash.com/photo-1527477396000-e27163b481c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
          title: "Gà Ủ Muối Đặc Biệt",
          description:
            "Món gà ủ muối đặc trưng, được chế biến theo công thức gia truyền",
          cta: "Đặt món ngay",
          ctaLink: "/menu",
          displayOrder: 2,
          isActive: true,
        },
        {
          id: "slide4",
          image:
            "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
          title: "Chân Gà Rút Xương",
          description:
            "Chân gà rút xương được chế biến với nhiều hương vị độc đáo: sả tắc, xốt Thái, ủ muối hoa tiêu",
          cta: "Xem thực đơn",
          ctaLink: "/menu",
          displayOrder: 3,
          isActive: true,
        },
        {
          id: "slide5",
          image:
            "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
          title: "Món Đặc Biệt",
          description:
            "Khám phá các món đặc biệt như nghêu trộn xốt Thái, nem chả với xốt thần thánh độc quyền",
          cta: "Khám phá ngay",
          ctaLink: "/menu",
          displayOrder: 4,
          isActive: true,
        },
      ];

      // Create a batch
      const batch = writeBatch(db);

      // Add all default sliders
      for (const slider of defaultSliders) {
        const docRef = doc(db, SLIDER_COLLECTION, slider.id);

        const { id, ...sliderData } = slider;

        batch.set(docRef, {
          ...sliderData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      // Commit the batch
      await batch.commit();

      showSuccess("Đã khởi tạo dữ liệu slider mặc định thành công!");
      return true;
    } catch (err: any) {
      console.error("Error initializing sliders:", err);
      setError(`Could not initialize sliders: ${err.message}`);
      showError("Có lỗi xảy ra khi khởi tạo dữ liệu slider mặc định!");
      return false;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  return {
    getAllSliders,
    getActiveSliders,
    getSlider,
    addSlider,
    updateSlider,
    deleteSlider,
    updateSlidersOrder,
    initializeDefaultSliders,
    loading,
    error,
  };
}
