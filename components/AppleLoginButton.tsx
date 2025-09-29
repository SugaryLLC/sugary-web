/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { socialLoginApple } from "@/actions/auth/appleLogin";
import { useCurrentUser } from "@/context/UserProvider";

declare global {
  interface Window {
    AppleID: any;
  }
}

export default function AppleLoginButton() {
  const [isAppleReady, setAppleReady] = useState(false);
  const { currentUser } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    script.async = true;
    script.onload = () => {
      window.AppleID?.auth.init({
        clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID,
        scope: "email name",
        redirectURI: "https://gift.sugary.me/apple",
        usePopup: true,
      });
      setAppleReady(true);
    };
    document.head.appendChild(script);
  }, []);

  async function handleAppleLogin() {
    if (!isAppleReady || loading) return;
    setLoading(true);
    try {
      const response = await window.AppleID.auth.signIn();
      const identityToken = response.authorization.id_token;
      const user = response.user;

      const result = await socialLoginApple({
        Token: identityToken,
        FirstName: user?.name?.firstName,
        LastName: user?.name?.lastName,
        GuestUserId:
          currentUser?.Id || localStorage.getItem("guestUserId") || undefined,
        IsWeb: true,
      });

      if (result.success) {
        toast.success("🍎 Apple login successful");
        window.location.href = "/";
      } else {
        toast.error(result.message || "Apple login failed");
      }
    } catch (err: any) {
      console.error("Apple login error:", err);
      toast.error("Apple login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      onClick={handleAppleLogin}
      disabled={!isAppleReady || loading}
      className="bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-3 transition-colors duration-200 w-full"
    >
      {/* Apple Logo SVG */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="flex-shrink-0"
      >
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
      {loading ? "Signing in…" : "Sign in with Apple"}
    </Button>
  );
}
