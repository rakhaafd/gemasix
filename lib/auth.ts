import { collection, getDocs } from "firebase/firestore";
import { clientDb } from "./firebase-client";

const SESSION_KEY = "gemasix_admin_session";

export interface UserAccount {
  id?: string;
  username: string;
  password?: string;
}

export const loginAdmin = async (usernameInput: string, passwordInput: string): Promise<boolean> => {
  try {
    const collectionsToTry = ["users", "user"];

    for (const colName of collectionsToTry) {
      const colRef = collection(clientDb, colName);
      const snapshot = await getDocs(colRef);

      if (!snapshot.empty) {
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          const dbUser = data.username || data.user || data.email;
          const dbPw = data.password || data.pw || data.pass;

          if (
            dbUser &&
            dbPw &&
            String(dbUser).trim() === usernameInput.trim() &&
            String(dbPw).trim() === passwordInput.trim()
          ) {
            if (typeof window !== "undefined") {
              localStorage.setItem(SESSION_KEY, JSON.stringify({
                username: dbUser,
                loggedInAt: Date.now(),
              }));
            }
            return true;
          }
        }
      }
    }

    return false;
  } catch (error) {
    console.error("Login failed:", error);
    return false;
  }
};

export const logoutAdmin = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
};

export const isAdminLoggedIn = (): boolean => {
  if (typeof window === "undefined") return false;
  const session = localStorage.getItem(SESSION_KEY);
  return !!session;
};
