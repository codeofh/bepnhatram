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
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseInitialized } from '@/lib/firebase';
import { useRouter } from 'next/router';
import { useToastContext } from '@/contexts/ToastContext';

interface UserData {
  name: string;
  email: string;
  phone?: string;
  createdAt: any;
  lastLogin: any;
  authProvider?: string;
}

interface AuthHookReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  register: (name: string, email: string, password: string) => Promise<User | null>;
  login: (email: string, password: string) => Promise<User | null>;
  loginWithGoogle: () => Promise<User | null>;
  loginWithFacebook: () => Promise<User | null>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  sendVerificationEmail: () => Promise<boolean>;
}

export function useAuth(): AuthHookReturn {
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

  const register = async (name: string, email: string, password: string): Promise<User | null> => {
    if (!isFirebaseInitialized()) {
      setError("Firebase không được khởi tạo");
      showError("Firebase không được khởi tạo");
      return null;
    }

    setError(null);
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
      const user = userCredential.user;

      // Update operations
      const updateOperations = [];

      // Update profile with display name
      updateOperations.push(
        updateProfile(user, { displayName: name })
          .catch(err => console.error("Không thể cập nhật tên người dùng:", err))
      );

      // Send verification email
      updateOperations.push(
        sendEmailVerification(user)
          .catch(err => console.error("Không thể gửi email xác thực:", err))
      );

      // Create user document in Firestore
      const userData: UserData = {
        name,
        email,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        authProvider: 'email'
      };

      updateOperations.push(
        setDoc(doc(db!, 'users', user.uid), userData)
          .catch(err => console.error("Không thể lưu dữ liệu người dùng vào Firestore:", err))
      );

      // Wait for all operations to complete
      await Promise.allSettled(updateOperations);

      showSuccess("Đăng ký tài khoản thành công! Vui lòng kiểm tra email để xác thực tài khoản.");
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
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "Quá nhiều yêu cầu. Vui lòng thử lại sau";
      }

      setError(errorMessage);
      showError(errorMessage);
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<User | null> => {
    if (!isFirebaseInitialized()) {
      setError("Firebase không được khởi tạo");
      showError("Firebase không được khởi tạo");
      return null;
    }

    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth!, email, password);

      // Update last login time
      try {
        await setDoc(doc(db!, 'users', userCredential.user.uid), {
          lastLogin: serverTimestamp()
        }, { merge: true });
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
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = "Tài khoản đã bị vô hiệu hóa";
      }

      setError(errorMessage);
      showError(errorMessage);
      return null;
    }
  };

  const socialLogin = async (provider: 'google' | 'facebook'): Promise<User | null> => {
    if (!isFirebaseInitialized()) {
      setError("Firebase không được khởi tạo");
      showError("Firebase không được khởi tạo");
      return null;
    }

    try {
      const authProvider = provider === 'google'
        ? new GoogleAuthProvider()
        : new FacebookAuthProvider();

      const result = await signInWithPopup(auth!, authProvider);
      const user = result.user;

      try {
        // Check if user exists in database, if not create a new user document
        const userDoc = await getDoc(doc(db!, 'users', user.uid));

        if (!userDoc.exists()) {
          await setDoc(doc(db!, 'users', user.uid), {
            name: user.displayName,
            email: user.email,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            authProvider: provider
          });
        } else {
          // Update last login
          await setDoc(doc(db!, 'users', user.uid), {
            lastLogin: serverTimestamp()
          }, { merge: true });
        }
      } catch (dbErr) {
        console.error(`Không thể lưu dữ liệu người dùng vào Firestore:`, dbErr);
        // Continue even if database write fails
      }

      showSuccess(`Đăng nhập với ${provider === 'google' ? 'Google' : 'Facebook'} thành công!`);
      return user;
    } catch (err: any) {
      console.error(`Lỗi đăng nhập với ${provider}:`, err);
      let errorMessage = `Đăng nhập với ${provider === 'google' ? 'Google' : 'Facebook'} thất bại`;

      if (err.code === 'auth/unauthorized-domain') {
        errorMessage = "Lỗi cấu hình đăng nhập. Vui lòng liên hệ quản trị viên";
      } else 
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = "Cửa sổ đăng nhập đã bị đóng";
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = "Lỗi kết nối mạng";
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        errorMessage = "Tài khoản đã tồn tại với email này. Vui lòng sử dụng phương thức đăng nhập khác";
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMessage = "Chỉ được mở một cửa sổ đăng nhập mỗi lần";
      }

      setError(errorMessage);
      showError(errorMessage);
      return null;
    }
  };

  const loginWithGoogle = (): Promise<User | null> => {
    return socialLogin('google');
  };

  const loginWithFacebook = (): Promise<User | null> => {
    return socialLogin('facebook');
  };

  const logout = async (): Promise<void> => {
    if (!isFirebaseInitialized()) {
      setError("Firebase không được khởi tạo");
      showError("Firebase không được khởi tạo");
      return;
    }

    try {
      await signOut(auth!);
      showSuccess("Đăng xuất thành công!");
    } catch (err: any) {
      console.error("Lỗi đăng xuất:", err);
      setError("Đăng xuất thất bại");
      showError("Đăng xuất thất bại");
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    if (!isFirebaseInitialized()) {
      setError("Firebase không được khởi tạo");
      showError("Firebase không được khởi tạo");
      return false;
    }

    try {
      await sendPasswordResetEmail(auth!, email);
      showSuccess("Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.");
      return true;
    } catch (err: any) {
      console.error("Lỗi đặt lại mật khẩu:", err);
      let errorMessage = "Không thể gửi email đặt lại mật khẩu";

      if (err.code === 'auth/user-not-found') {
        errorMessage = "Không tìm thấy tài khoản với email này";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Email không hợp lệ";
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "Quá nhiều yêu cầu. Vui lòng thử lại sau";
      }

      setError(errorMessage);
      showError(errorMessage);
      return false;
    }
  };

  const sendVerificationEmail = async (): Promise<boolean> => {
    if (!isFirebaseInitialized() || !user) {
      setError("Không thể gửi email xác thực");
      showError("Không thể gửi email xác thực");
      return false;
    }

    try {
      await sendEmailVerification(user);
      showSuccess("Email xác thực đã được gửi. Vui lòng kiểm tra hộp thư của bạn.");
      return true;
    } catch (err: any) {
      console.error("Lỗi gửi email xác thực:", err);
      setError("Không thể gửi email xác thực");
      showError("Không thể gửi email xác thực");
      return false;
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
    logout,
    resetPassword,
    sendVerificationEmail
  };
}