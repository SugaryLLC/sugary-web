"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser } from "@/actions/auth/getCurrentUser";

type UserContextType = {
  currentUser: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  setCurrentUser: (user: User | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    setLoading(true);
    const result = await getCurrentUser();
    if (result.success) {
      console.log("Current user:", result.user);
      setCurrentUser(result.user);
    } else {
      console.log("⚠️ No user found");
      setCurrentUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshUser(); // runs once client-side
  }, []);

  return (
    <UserContext.Provider
      value={{ currentUser, loading, refreshUser, setCurrentUser }}
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
