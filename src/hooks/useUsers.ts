import { useState, useCallback, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  setDoc,
  orderBy,
  Timestamp,
  limit,
  startAfter,
  DocumentData,
  DocumentSnapshot,
} from "firebase/firestore";
import {
  db,
  isFirebaseInitialized,
  safeFirestoreOperation,
} from "@/lib/firebase";
import { User as FirebaseUser } from "firebase/auth";
import { useFirestore } from "./useFirestore";
import { useToastContext } from "@/contexts/ToastContext";
import { faker } from "@faker-js/faker/locale/vi";

export interface UserRole {
  admin?: boolean;
  customer?: boolean;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  createdAt?: number | Timestamp;
  lastLogin?: number | Timestamp;
  authProvider?: string;
  phone?: string;
  role?: UserRole;
  status?: "active" | "blocked" | "pending";
  emailVerified?: boolean;
}

interface UseUsersReturn {
  users: UserData[];
  loading: boolean;
  error: string | null;
  getUsers: () => Promise<UserData[]>;
  getUserById: (id: string) => Promise<UserData | null>;
  updateUser: (id: string, data: Partial<UserData>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  makeAdmin: (id: string) => Promise<boolean>;
  removeAdmin: (id: string) => Promise<boolean>;
  blockUser: (id: string) => Promise<boolean>;
  activateUser: (id: string) => Promise<boolean>;
  searchUsers: (query: string) => Promise<UserData[]>;
  generateSampleUsers: (count?: number) => Promise<boolean>;
  isAdminUser: (id: string) => Promise<boolean>;
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useToastContext();
  const {
    getCollection,
    setDocument,
    updateDocument,
    deleteDocument,
    getDocument,
  } = useFirestore();

  const USERS_COLLECTION = "users";
  const ADMINS_COLLECTION = "admins";

  // Get all users from Firestore
  const getUsers = useCallback(async (): Promise<UserData[]> => {
    setLoading(true);
    setError(null);

    try {
      if (!isFirebaseInitialized()) {
        throw new Error("Firebase không được khởi tạo");
      }

      // Get all users from the users collection
      const usersData = await safeFirestoreOperation<UserData[]>(async () => {
        const userSnapshot = await getDocs(collection(db!, USERS_COLLECTION));
        const users = userSnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as UserData,
        );

        // Fetch admin status for each user
        const usersWithRoles = await Promise.all(
          users.map(async (user) => {
            const isAdmin = await isAdminUser(user.id);
            return {
              ...user,
              role: {
                ...(user.role || {}),
                admin: isAdmin,
                customer: true,
              },
            };
          }),
        );

        return usersWithRoles;
      }, []);

      // Sort users by creation date (newest first)
      const sortedUsers = usersData.sort((a, b) => {
        const timeA =
          a.createdAt instanceof Timestamp
            ? a.createdAt.toMillis()
            : typeof a.createdAt === "number"
              ? a.createdAt
              : 0;

        const timeB =
          b.createdAt instanceof Timestamp
            ? b.createdAt.toMillis()
            : typeof b.createdAt === "number"
              ? b.createdAt
              : 0;

        return timeB - timeA;
      });

      setUsers(sortedUsers);
      setLoading(false);
      return sortedUsers;
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.message || "Không thể tải danh sách người dùng");
      setLoading(false);
      return [];
    }
  }, []);

  // Get single user by ID
  const getUserById = async (id: string): Promise<UserData | null> => {
    try {
      if (!isFirebaseInitialized()) {
        throw new Error("Firebase không được khởi tạo");
      }

      return await safeFirestoreOperation<UserData | null>(async () => {
        const userDoc = await getDocument<UserData>(USERS_COLLECTION, id);

        if (!userDoc) {
          return null;
        }

        // Check if user is admin
        const isAdmin = await isAdminUser(id);

        return {
          ...userDoc,
          role: {
            ...(userDoc.role || {}),
            admin: isAdmin,
            customer: true,
          },
        };
      }, null);
    } catch (err: any) {
      console.error(`Error fetching user with ID ${id}:`, err);
      showError(err.message || "Không thể tải thông tin người dùng");
      return null;
    }
  };

  // Update user data
  const updateUser = async (
    id: string,
    data: Partial<UserData>,
  ): Promise<boolean> => {
    try {
      if (!isFirebaseInitialized()) {
        throw new Error("Firebase không được khởi tạo");
      }

      await safeFirestoreOperation(async () => {
        await updateDocument(USERS_COLLECTION, id, data);
      });

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === id ? { ...user, ...data } : user)),
      );

      showSuccess("Cập nhật người dùng thành công!");
      return true;
    } catch (err: any) {
      console.error("Error updating user:", err);
      showError(err.message || "Không thể cập nhật người dùng");
      return false;
    }
  };

  // Delete user from Firestore (Note: This doesn't delete the auth user)
  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      if (!isFirebaseInitialized()) {
        throw new Error("Firebase không được khởi tạo");
      }

      // Check if user is admin and remove admin role first
      const isAdmin = await isAdminUser(id);
      if (isAdmin) {
        await safeFirestoreOperation(async () => {
          await deleteDocument(ADMINS_COLLECTION, id);
        });
      }

      // Delete user from Firestore
      await safeFirestoreOperation(async () => {
        await deleteDocument(USERS_COLLECTION, id);
      });

      // Update local state
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));

      showSuccess("Xóa người dùng thành công!");
      return true;
    } catch (err: any) {
      console.error("Error deleting user:", err);
      showError(err.message || "Không thể xóa người dùng");
      return false;
    }
  };

  // Make a user an admin
  const makeAdmin = async (id: string): Promise<boolean> => {
    try {
      if (!isFirebaseInitialized()) {
        throw new Error("Firebase không được khởi tạo");
      }

      const userData = await getUserById(id);
      if (!userData) {
        throw new Error("Không tìm thấy người dùng");
      }

      // Add user to admins collection
      await safeFirestoreOperation(async () => {
        await setDocument(ADMINS_COLLECTION, id, {
          isAdmin: true,
          createdAt: new Date(),
          role: "admin",
          name: userData.name,
          email: userData.email,
        });
      });

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === id
            ? {
                ...user,
                role: {
                  ...(user.role || {}),
                  admin: true,
                },
              }
            : user,
        ),
      );

      showSuccess("Đã cấp quyền admin cho người dùng thành công!");
      return true;
    } catch (err: any) {
      console.error("Error making user admin:", err);
      showError(err.message || "Không thể cấp quyền admin cho người dùng");
      return false;
    }
  };

  // Remove admin role from a user
  const removeAdmin = async (id: string): Promise<boolean> => {
    try {
      if (!isFirebaseInitialized()) {
        throw new Error("Firebase không được khởi tạo");
      }

      // Remove user from admins collection
      await safeFirestoreOperation(async () => {
        await deleteDocument(ADMINS_COLLECTION, id);
      });

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === id
            ? {
                ...user,
                role: {
                  ...(user.role || {}),
                  admin: false,
                },
              }
            : user,
        ),
      );

      showSuccess("Đã thu hồi quyền admin từ người dùng thành công!");
      return true;
    } catch (err: any) {
      console.error("Error removing admin role:", err);
      showError(err.message || "Không thể thu hồi quyền admin từ người dùng");
      return false;
    }
  };

  // Block a user
  const blockUser = async (id: string): Promise<boolean> => {
    try {
      return await updateUser(id, { status: "blocked" });
    } catch (err: any) {
      console.error("Error blocking user:", err);
      showError(err.message || "Không thể khóa người dùng");
      return false;
    }
  };

  // Activate a user
  const activateUser = async (id: string): Promise<boolean> => {
    try {
      return await updateUser(id, { status: "active" });
    } catch (err: any) {
      console.error("Error activating user:", err);
      showError(err.message || "Không thể kích hoạt người dùng");
      return false;
    }
  };

  // Search users by name or email
  const searchUsers = async (searchQuery: string): Promise<UserData[]> => {
    try {
      if (!isFirebaseInitialized() || !searchQuery.trim()) {
        return users;
      }

      const query = searchQuery.toLowerCase().trim();
      const filteredUsers = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.phone?.includes(query),
      );

      return filteredUsers;
    } catch (err: any) {
      console.error("Error searching users:", err);
      showError(err.message || "Không thể tìm kiếm người dùng");
      return [];
    }
  };

  // Generate sample users (for testing)
  const generateSampleUsers = async (count: number = 10): Promise<boolean> => {
    try {
      if (!isFirebaseInitialized()) {
        throw new Error("Firebase không được khởi tạo");
      }

      const sampleUsers: UserData[] = [];
      const now = Date.now();

      for (let i = 0; i < count; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const name = `${firstName} ${lastName}`;
        const email = faker.internet
          .email({ firstName, lastName })
          .toLowerCase();
        const id = `sample_${faker.string.uuid()}`;

        const userData: UserData = {
          id,
          email,
          name,
          photoURL: faker.image.avatar(),
          phone: faker.phone.number(),
          createdAt:
            now - faker.number.int({ min: 0, max: 30 * 24 * 60 * 60 * 1000 }), // Up to 30 days ago
          lastLogin:
            now - faker.number.int({ min: 0, max: 7 * 24 * 60 * 60 * 1000 }), // Up to 7 days ago
          authProvider: faker.helpers.arrayElement([
            "email",
            "google",
            "facebook",
          ]),
          status: faker.helpers.arrayElement(["active", "pending", "blocked"]),
          emailVerified: faker.datatype.boolean(0.7), // 70% verified
          role: {
            customer: true,
            admin: faker.datatype.boolean(0.2), // 20% chance of being admin
          },
        };

        sampleUsers.push(userData);

        // Add user to users collection
        await safeFirestoreOperation(async () => {
          await setDocument(USERS_COLLECTION, id, userData);
        });

        // Add admin users to admins collection
        if (userData.role?.admin) {
          await safeFirestoreOperation(async () => {
            await setDocument(ADMINS_COLLECTION, id, {
              isAdmin: true,
              createdAt: new Date(userData.createdAt as number),
              role: "admin",
              email: userData.email,
              name: userData.name,
            });
          });
        }
      }

      // Update local state
      await getUsers();

      showSuccess(`Đã tạo ${count} người dùng mẫu thành công!`);
      return true;
    } catch (err: any) {
      console.error("Error generating sample users:", err);
      showError(err.message || "Không thể tạo người dùng mẫu");
      return false;
    }
  };

  // Check if a user is an admin
  const isAdminUser = async (userId: string): Promise<boolean> => {
    try {
      if (!isFirebaseInitialized()) {
        return false;
      }

      return await safeFirestoreOperation(async () => {
        const adminDoc = await getDoc(doc(db!, ADMINS_COLLECTION, userId));
        return adminDoc.exists();
      }, false);
    } catch (err) {
      console.error("Error checking admin status:", err);
      return false;
    }
  };

  return {
    users,
    loading,
    error,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    makeAdmin,
    removeAdmin,
    blockUser,
    activateUser,
    searchUsers,
    generateSampleUsers,
    isAdminUser,
  };
}
