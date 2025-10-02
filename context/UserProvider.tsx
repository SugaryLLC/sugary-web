"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser } from "@/actions/auth/getCurrentUser";

type UserContextType = {
  currentUser: User | null;
  refreshUser: () => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser);

  const refreshUser = async () => {
    const result = await getCurrentUser();
    if (result.success) {
      setCurrentUser(result.user);
      console.log("🙋‍♂️ currentUser ---->", currentUser);
    } else {
      console.warn("⚠️ Failed to refresh user, fallback to null/guest");
      setCurrentUser(null);
    }
  };

  async function logout() {
    await fetch("/api/auth/logout", { method: "GET" });
    setCurrentUser(null);
    // Force reload so middleware can create a new guest session
    window.location.reload();
  }
  // Background refresh to update if stale
  useEffect(() => {
    if (!initialUser) {
      refreshUser(); // first time guest fallback
    } else {
      // Still refresh to ensure validity
      refreshUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <UserContext.Provider
      value={{ currentUser, refreshUser, setCurrentUser, logout }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useCurrentUser must be used inside UserProvider");
  return ctx;
}
