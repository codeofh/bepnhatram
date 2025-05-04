import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';

interface AdminUser extends User {
  isAdmin?: boolean;
}

export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          // Check if user is an admin
          const userRef = doc(db, 'admins', authUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const adminUser = {...authUser, isAdmin: true} as AdminUser;
            setUser(adminUser);
          } else {
            // User exists but is not an admin
            await signOut(auth);
            setUser(null);
            setError("Bạn không có quyền truy cập vào trang quản trị");
          }
        } catch (err) {
          console.error("Error checking admin status:", err);
          setError("Có lỗi khi kiểm tra quyền admin");
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại");
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || "Đăng xuất thất bại");
    }
  };

  return { user, loading, error, login, logout };
}