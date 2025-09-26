/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useTransition } from "react";

export default function GuestUserProfile() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const loadUserData = () => {
    start(async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/current-user", {
          method: "GET",
          credentials: "include", // important so cookies (access_token) are sent
        });

        const result = await res.json();

        if (result?.success && result?.user) {
          setUser(result.user);
        } else {
          setError(result?.message || "Failed to load user data");
        }
      } catch (err: any) {
        setError(err?.message || "Network error");
      } finally {
        setLoading(false);
      }
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

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-red-700 font-medium">Error loading user data</div>
        <div className="text-red-600 text-sm mt-1">{error}</div>
        <button
          onClick={loadUserData}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          Retry
        </button>
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
