import { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  User,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/router';
import { useToastContext } from '@/contexts/ToastContext';

interface UserData {
  name: string;
  email: string;
  phone?: string;
  createdAt: any;
  lastLogin: any;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { showSuccess, showError } = useToastContext();
  
  // Skip Firebase interactions during server-side rendering
  const isClient = typeof window !== 'undefined';

  useEffect(() => {
    // Only run on client-side
    if (!isClient || !auth) {
      setLoading(false);
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isClient]);

  const register = async (name: string, email: string, password: string) => {
    if (!isClient) {
      setError("Firebase không được khởi tạo khi đang ở server-side");
      return null;
    }
    
    if (!auth || !db) {
      console.error("Firebase auth hoặc db chưa được khởi tạo");
      setError("Firebase không được khởi tạo đúng cách");
      return null;
    }
    
    setError(null);
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      try {
        // Update profile with display name
        await updateProfile(user, {
          displayName: name
        });
      } catch (profileErr) {
        console.error("Không thể cập nhật tên người dùng:", profileErr);
        // Continue even if profile update fails
      }
      
      try {
        // Create user document in Firestore
        const userData: UserData = {
          name,
          email,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        };
        
        await setDoc(doc(db, 'users', user.uid), userData);
      } catch (dbErr) {
        console.error("Không thể lưu dữ liệu người dùng vào Firestore:", dbErr);
        // Continue even if database write fails
      }
      
      showSuccess("Đăng ký tài khoản thành công!");
      return user;
    } catch (err: any) {
      console.error("Lỗi đăng ký:", err);
      let errorMessage = "Đăng ký thất bại";
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = "Email đã được sử dụng";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Email không hợp lệ";
      } else if (err.code === 'auth/weak-password') {
        errorMessage = "Mật khẩu quá yếu";
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = "Lỗi kết nối mạng";
      }
      
      setError(errorMessage);
      showError(errorMessage);
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    if (!isClient) {
      setError("Firebase không được khởi tạo khi đang ở server-side");
      return null;
    }
    
    if (!auth || !db) {
      console.error("Firebase auth hoặc db chưa được khởi tạo");
      setError("Firebase không được khởi tạo đúng cách");
      return null;
    }
    
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login time
      try {
        if (userCredential.user && db) {
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            lastLogin: serverTimestamp()
          }, { merge: true });
        }
      } catch (dbErr) {
        console.error("Không thể cập nhật thời gian đăng nhập:", dbErr);
        // Continue even if database write fails
      }
      
      showSuccess("Đăng nhập thành công!");
      return userCredential.user;
    } catch (err: any) {
      console.error("Lỗi đăng nhập:", err);
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
      return null;
    }
  };

  const loginWithGoogle = async () => {
    if (!isClient) {
      setError("Firebase không được khởi tạo khi đang ở server-side");
      return null;
    }
    
    if (!auth || !db) {
      console.error("Firebase auth hoặc db chưa được khởi tạo");
      setError("Firebase không được khởi tạo đúng cách");
      return null;
    }
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      try {
        // Check if user exists in database, if not create a new user document
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
          await setDoc(doc(db, 'users', user.uid), {
            name: user.displayName,
            email: user.email,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            authProvider: 'google'
          });
        } else {
          // Update last login
          await setDoc(doc(db, 'users', user.uid), {
            lastLogin: serverTimestamp()
          }, { merge: true });
        }
      } catch (dbErr) {
        console.error("Không thể lưu dữ liệu người dùng vào Firestore:", dbErr);
        // Continue even if database write fails
      }
      
      showSuccess("Đăng nhập với Google thành công!");
      return user;
    } catch (err: any) {
      console.error("Lỗi đăng nhập với Google:", err);
      let errorMessage = "Đăng nhập với Google thất bại";
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = "Cửa sổ đăng nhập đã bị đóng";
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = "Lỗi kết nối mạng";
      }
      
      setError(errorMessage);
      showError(errorMessage);
      return null;
    }
  };

  const loginWithFacebook = async () => {
    if (!isClient) {
      setError("Firebase không được khởi tạo khi đang ở server-side");
      return null;
    }
    
    if (!auth || !db) {
      console.error("Firebase auth hoặc db chưa được khởi tạo");
      setError("Firebase không được khởi tạo đúng cách");
      return null;
    }
    
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      try {
        // Check if user exists in database, if not create a new user document
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
          await setDoc(doc(db, 'users', user.uid), {
            name: user.displayName,
            email: user.email,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            authProvider: 'facebook'
          });
        } else {
          // Update last login
          await setDoc(doc(db, 'users', user.uid), {
            lastLogin: serverTimestamp()
          }, { merge: true });
        }
      } catch (dbErr) {
        console.error("Không thể lưu dữ liệu người dùng vào Firestore:", dbErr);
        // Continue even if database write fails
      }
      
      showSuccess("Đăng nhập với Facebook thành công!");
      return user;
    } catch (err: any) {
      console.error("Lỗi đăng nhập với Facebook:", err);
      let errorMessage = "Đăng nhập với Facebook thất bại";
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = "Cửa sổ đăng nhập đã bị đóng";
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = "Lỗi kết nối mạng";
      }
      
      setError(errorMessage);
      showError(errorMessage);
      return null;
    }
  };

  const logout = async () => {
    if (!isClient) {
      setError("Firebase không được khởi tạo khi đang ở server-side");
      return;
    }
    
    if (!auth) {
      console.error("Firebase auth chưa được khởi tạo");
      setError("Firebase không được khởi tạo đúng cách");
      return;
    }
    
    try {
      await signOut(auth);
      showSuccess("Đăng xuất thành công!");
    } catch (err: any) {
      console.error("Lỗi đăng xuất:", err);
      setError("Đăng xuất thất bại");
      showError("Đăng xuất thất bại");
    }
  };

  return { 
    user, 
    loading, 
    error,
    register,
    login,
    loginWithGoogle,
    loginWithFacebook,
    logout
  };
}