import { useState, useEffect } from 'react';
import { auth, db, isFirebaseInitialized, safeFirestoreOperation } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToastContext } from '@/contexts/ToastContext';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface AdminUser extends User {
  isAdmin?: boolean;
}

export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user: authUser } = useAuthContext();
  const { showSuccess, showError } = useToastContext();
  const { isOnline } = useNetworkStatus();

  // Function to check if a user is an admin
  const checkAdminStatus = async (userId: string): Promise<boolean> => {
    if (!db) {
      console.error("Firestore is not initialized");
      throw new Error("Firestore is not initialized");
    }
    
    try {
      console.log("Checking admin status for user ID:", userId);
      
      return await safeFirestoreOperation(async () => {
        const userRef = doc(db, 'admins', userId);
        const userSnap = await getDoc(userRef);
        
        // User exists in admins collection
        if (userSnap.exists()) {
          console.log("User is an admin:", userSnap.data());
          return true;
        }
        
        console.log("User is not an admin");
        
        // For development: auto-create admin user if admins collection is empty
        if (process.env.NODE_ENV === 'development') {
          try {
            // Check if admins collection is empty
            const adminsRef = collection(db, 'admins');
            const adminsSnapshot = await getDocs(adminsRef);
            
            if (adminsSnapshot.empty) {
              console.log("Admins collection is empty, creating first admin user");
              // Create the first admin
              await setDoc(userRef, {
                isAdmin: true,
                createdAt: new Date(),
                role: 'admin',
                note: 'Auto-created first admin in development mode'
              });
              console.log("Created first admin user successfully");
              return true;
            }
          } catch (err) {
            console.error("Failed to check or create admin:", err);
          }
        }
        
        return false;
      }, false); // Default to not admin if offline
    } catch (err) {
      console.error("Error checking admin status:", err);
      if (!isOnline) {
        showError("Không thể kiểm tra quyền admin khi không có kết nối mạng");
      }
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

    // Check if we're on the debug page - special case to bypass admin check temporarily
    const isDebugPage = router.pathname === '/admin/debug';
    
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          // If we're on the debug page, allow access for any authenticated user
          if (isDebugPage) {
            const adminUser = {...authUser, isAdmin: true} as AdminUser;
            setUser(adminUser);
            setLoading(false);
            return;
          }
          
          // If offline and not on debug page, show message
          if (!isOnline && !isDebugPage) {
            setError("Không thể xác thực quyền admin khi không có kết nối mạng");
            showError("Không thể xác thực quyền admin khi không có kết nối mạng");
            setLoading(false);
            return;
          }
          
          // Otherwise check if user is actually an admin
          const isAdmin = await checkAdminStatus(authUser.uid);
          
          if (isAdmin) {
            const adminUser = {...authUser, isAdmin: true} as AdminUser;
            setUser(adminUser);
          } else {
            // User exists but is not an admin
            if (router.pathname.startsWith('/admin') && router.pathname !== '/admin' && router.pathname !== '/admin/debug') {
              // Don't sign out if we're just on the login page
              if (isOnline) {
                await signOut(auth);
              }
            }
            setUser(null);
            setError("Bạn không có quyền truy cập vào trang quản trị");
            showError("Bạn không có quyền truy cập vào trang quản trị");
          }
        } catch (err: any) {
          console.error("Error checking admin status:", err);
          if (err.message?.includes('offline') || err.code === 'unavailable') {
            setError("Không thể kiểm tra quyền admin khi không có kết nối mạng");
            showError("Không thể kiểm tra quyền admin khi không có kết nối mạng");
          } else {
            setError("Có lỗi khi kiểm tra quyền admin. Vui lòng thử lại sau.");
            showError("Có lỗi khi kiểm tra quyền admin. Vui lòng thử lại sau.");
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router.pathname, showError, isOnline]);

  // When authUser changes (from AuthContext), check if they have admin privileges
  useEffect(() => {
    const checkSocialAuthAdminStatus = async () => {
      if (authUser && db && !user && isOnline) {
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
  }, [authUser, user, db, showError, isOnline]);

  const login = async (email: string, password: string) => {
    if (!isFirebaseInitialized()) {
      setError("Firebase không được khởi tạo");
      showError("Firebase không được khởi tạo");
      return;
    }
    
    if (!isOnline) {
      setError("Không thể đăng nhập khi không có kết nối mạng");
      showError("Không thể đăng nhập khi không có kết nối mạng");
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
      } else if (err.code) {
        errorMessage = `Lỗi đăng nhập: ${err.code}`;
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
    
    if (!isOnline) {
      setError("Không thể đăng xuất hoàn toàn khi không có kết nối mạng");
      showError("Không thể đăng xuất hoàn toàn khi không có kết nối mạng");
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
      console.error("Firestore is not initialized");
      throw new Error("Firestore is not initialized");
    }
    
    if (!isOnline) {
      throw new Error("Không thể tạo ngư��i dùng admin khi không có kết nối mạng");
    }
    
    try {
      console.log("Creating admin user with ID:", userId);
      const userRef = doc(db, 'admins', userId);
      
      // Check if this admin already exists
      const existingDoc = await getDoc(userRef);
      if (existingDoc.exists()) {
        console.log("Admin already exists:", existingDoc.data());
        return true;
      }
      
      // Create new admin record
      await setDoc(userRef, {
        isAdmin: true,
        createdAt: new Date(),
        role: 'admin',
        note: 'Created from admin debug page'
      });
      
      console.log("Admin user created successfully");
      showSuccess("Tài khoản admin đã được tạo thành công!");
      
      return true;
    } catch (err) {
      console.error("Failed to create admin user:", err);
      throw err;
    }
  };

  // Check if a user is already an admin
  const isUserAdmin = async (userId: string): Promise<boolean> => {
    if (!db || !isOnline) return false;
    
    try {
      return await safeFirestoreOperation(async () => {
        const userRef = doc(db, 'admins', userId);
        const userSnap = await getDoc(userRef);
        return userSnap.exists();
      }, false);
    } catch (err) {
      console.error("Error checking if user is admin:", err);
      return false;
    }
  };

  return { 
    user, 
    loading, 
    error, 
    login, 
    logout,
    createAdminUser,
    isUserAdmin,
    checkAdminStatus,
    isOnline
  };
}