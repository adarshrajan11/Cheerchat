import { useState, useEffect, createContext, useContext } from "react";
import { auth, handleRedirect, login } from "@/lib/firebase";
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signOut as firebaseSignOut,
} from "firebase/auth";
import type { User } from "@shared/schema";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  firebaseUid: string;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();

  useEffect(() => {
    let isRedirectHandled = false;

    const processAuth = async () => {
      try {
        const redirectedUser = await handleRedirect();
        if (redirectedUser) {
          isRedirectHandled = true;
          setFirebaseUser(redirectedUser);
          await handleUserSync(redirectedUser);
        }
      } catch (error) {
        console.error("Redirect handling error:", error);
      }
    };

    processAuth();

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!isRedirectHandled) {
        if (fbUser) {
          setFirebaseUser(fbUser);
          await handleUserSync(fbUser);
        } else {
          setUser(null);
          setFirebaseUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);



  const handleUserSync = async (fbUser: FirebaseUser) => {
    try {
      const response = await fetch(`/api/users/firebase/${fbUser.uid}`);

      if (response.ok) {
        const userData: User = await response.json();
        setUser(userData);
        navigate("/chat");
      } else if (response.status === 404) {
        await createNewUser(fbUser);
        navigate("/chat");
      } else {
        console.error("Failed to fetch user data:", response.statusText);
      }
    } catch (error) {
      console.error("User sync error:", error);
    }
  };

  const createNewUser = async (fbUser: FirebaseUser) => {
    try {
      const newUserResponse = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: fbUser.email?.split("@")[0] || "user",
          email: fbUser.email || "",
          displayName:
            fbUser.displayName || fbUser.email?.split("@")[0] || "Anonymous",
          photoURL: fbUser.photoURL,
          firebaseUid: fbUser.uid,
        }),
      });

      if (newUserResponse.ok) {
        const userData: User = await newUserResponse.json();
        setUser(userData);
      } else {
        console.error("Failed to create user:", newUserResponse.statusText);
      }
    } catch (error) {
      console.error("Create new user error:", error);
    }
  };

  const signIn = async () => {
    try {
      console.log('Attempting to sign in...');
      await login();
    } catch (error) {
      console.error("Sign-in error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
      navigate("/");
    } catch (error) {
      console.error("Sign-out error:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    firebaseUid: firebaseUser?.uid || "",
    user,
    firebaseUser,
    loading,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
