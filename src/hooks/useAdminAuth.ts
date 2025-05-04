import { useState, useEffect } from 'react';
import { auth, db, isFirebaseInitialized } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToastContext } from '@/contexts/ToastContext';

interface AdminUser extends User {
  isAdmin?: boolean;
}

export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user: authUser } = useAuthContext();
  const { showError } = useToastContext();

  // Function to check if a user is an admin
  const checkAdminStatus = async (userId: string): Promise<boolean> => {
    if (!db) {
      console.error("Firestore is not initialized");
      throw new Error("Firestore is not initialized");
    }
    
    try {
      const userRef = doc(db, 'admins', userId);
      const userSnap = await getDoc(userRef);
      
      // User exists in admins collection
      if (userSnap.exists()) {
        return true;
      }
      
      // For development: auto-create first admin user if admins collection is empty
      // This should be removed in production
      if (process.env.NODE_ENV === 'development') {
        try {
          // Only for the first user to sign in during development
          // Create admins collection and add this user as admin
          await setDoc(userRef, {
            isAdmin: true,
            createdAt: new Date(),
            role: 'admin'
          });
          console.log("Created first admin user in development mode");
          return true;
        } catch (err) {
          console.error("Failed to create admin user:", err);
          return false;
        }
      }
      
      return false;
    } catch (err) {
      console.error("Error checking admin status:", err);
      throw err;
    }
  };

  useEffect(() => {
    // Skip Firebase interactions during server-side rendering
    const isClient = typeof window !== 'undefined';
    if (!isClient || !isFirebaseInitialized()) {
      setLoading(false);
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          const isAdmin = await checkAdminStatus(authUser.uid);
          
          if (isAdmin) {
            const adminUser = {...authUser, isAdmin: true} as AdminUser;
            setUser(adminUser);
          } else {
            // User exists but is not an admin
            await signOut(auth);
            setUser(null);
            setError("Bạn không có quyền truy cập vào trang quản trị");
            showError("Bạn không có quyền truy cập vào trang quản trị");
          }
        } catch (err) {
          console.error("Error checking admin status:", err);
          setError("Có lỗi khi kiểm tra quyền admin. Vui lòng thử lại sau.");
          showError("Có lỗi khi kiểm tra quyền admin. Vui lòng thử lại sau.");
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [showError]);

  // When authUser changes (from AuthContext), check if they have admin privileges
  useEffect(() => {
    const checkSocialAuthAdminStatus = async () => {
      if (authUser && db && !user) {
        try {
          const isAdmin = await checkAdminStatus(authUser.uid);
          
          if (!isAdmin) {
            // If social login user is not an admin, show error but don't sign them out
            // since they might still want to use the regular site
            setError("Tài khoản này không có quyền truy cập vào trang quản trị");
            showError("Tài khoản này không có quyền truy cập vào trang quản trị");
          }
        } catch (err) {
          console.error("Error checking admin status for social login:", err);
          setError("Có lỗi khi kiểm tra quyền admin. Vui lòng thử lại sau.");
          showError("Có lỗi khi kiểm tra quyền admin. Vui lòng thử lại sau.");
        }
      }
    };
    
    checkSocialAuthAdminStatus();
  }, [authUser, user, db, showError]);

  const login = async (email: string, password: string) => {
    if (!isFirebaseInitialized()) {
      setError("Firebase không được khởi tạo");
      showError("Firebase không được khởi tạo");
      return;
    }
    
    setError(null);
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error("Login error:", err);
      let errorMessage = "Đăng nhập thất bại";
      
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = "Email hoặc mật khẩu không chính xác";
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau";
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = "Lỗi kết nối mạng";
      }
      
      setError(errorMessage);
      showError(errorMessage);
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!isFirebaseInitialized()) {
      setError("Firebase không được khởi tạo");
      showError("Firebase không được khởi tạo");
      return;
    }
    
    try {
      await signOut(auth);
      router.push('/admin');
    } catch (err: any) {
      console.error("Logout error:", err);
      setError("Đăng xuất thất bại");
      showError("Đăng xuất thất bại");
    }
  };

  // Create admin user function (for development purposes)
  const createAdminUser = async (userId: string) => {
    if (!db) {
      throw new Error("Firestore is not initialized");
    }
    
    try {
      const userRef = doc(db, 'admins', userId);
      await setDoc(userRef, {
        isAdmin: true,
        createdAt: new Date(),
        role: 'admin'
      });
      return true;
    } catch (err) {
      console.error("Failed to create admin user:", err);
      throw err;
    }
  };

  return { 
    user, 
    loading, 
    error, 
    login, 
    logout,
    // For development only
    createAdminUser 
  };
}