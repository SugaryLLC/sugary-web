/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { getCurrentUser } from "@/actions/auth/getCurrentUser";
import { useEffect, useState, useTransition } from "react";

export default function GuestUserProfile() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  const loadUserData = () => {
    startTransition(async () => {
      setLoading(true);

      const { user } = await getCurrentUser();

      if (user) {
        setUser(user);
      } else {
        console.log(user, "failed to load user");
      }

      setLoading(false);
    });
  };

  useEffect(() => {
    loadUserData();
  }, []);

  if (loading || pending) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading user data...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-gray-700">No user data found</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user?.FullName}</h1>
          <p className="text-gray-600">@{user?.Username}</p>
          {user?.IsGuest && (
            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              This is a Guest User
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              User ID
            </label>
            <p className="text-gray-900">{user?.Id}</p>
          </div>

          {user?.Email && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <p className="text-gray-900">{user?.Email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
