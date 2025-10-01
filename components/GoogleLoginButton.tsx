"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { socialLoginGoogle } from "@/actions/auth/google-login";
import { useCurrentUser } from "@/context/UserProvider";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    google: any;
  }
}

export default function GoogleOAuthButton() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const { currentUser, refreshUser } = useCurrentUser() as any; // adapt types as needed
  const router = useRouter();

  // exact scopes you requested
  const SCOPES =
    "email profile https://www.googleapis.com/auth/user.gender.read https://www.googleapis.com/auth/user.birthday.read";

  // Load Google JS SDK
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.google) {
      setIsLoaded(true);
      return;
    }

    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => setIsLoaded(true);
    s.onerror = () => {
      console.error("Failed to load Google SDK");
      toast.error("Failed to load Google SDK");
    };
    document.head.appendChild(s);
  }, []);

  async function handleGoogleOauthLogin() {
    if (!isLoaded || isRequesting) return;

    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      toast.error("Missing Google client ID");
      return;
    }

    setIsRequesting(true);

    try {
      // init token client
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        scope: SCOPES,
        // `callback` will be invoked after token is granted (or denied)
        callback: async (tokenResponse: any) => {
          try {
            if (!tokenResponse || !tokenResponse.access_token) {
              console.error("No access token received", tokenResponse);
              toast.error("Failed to get Google access token");
              setIsRequesting(false);
              return;
            }

            const accessToken = tokenResponse.access_token;

            // 🔑 Fetch profile info from Google
            const userInfoRes = await fetch(
              "https://www.googleapis.com/oauth2/v3/userinfo",
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            );
            const profile = await userInfoRes.json();
            const payload = {
              Provider: "google",
              Token: accessToken, // access token (People API)
              FirstName: profile?.FirstName,
              LastName: profile?.LastName,
              GuestUserId: currentUser?.Id,
              IsWeb: true,
            };

            // Call your server action (server-side will call /Auth/Social/Login and set cookies)
            const result = await socialLoginGoogle(payload);

            if (result?.success) {
              toast.success("✅ Logged in with Google");

              // Update local user context without full reload (if available)
              if (typeof refreshUser === "function") {
                await refreshUser();
                // optionally route to dashboard or home
                router.push("/");
              } else {
                window.location.href = "/";
              }
            } else {
              console.error("socialLoginGoogle failed:", result);
              toast.error(result?.message || "Google sign-in failed");
            }
          } catch (err: any) {
            console.error("People API / social login error:", err);
            toast.error(err?.message || "Google sign-in failed");
          } finally {
            setIsRequesting(false);
          }
        },
      });

      // Request an access token, prompt for consent to ensure scopes are granted
      tokenClient.requestAccessToken({ prompt: "consent" });
    } catch (err: any) {
      console.error("Google OAuth flow error:", err);
      toast.error(err?.message || "Google sign-in failed");
      setIsRequesting(false);
    }
  }

  return (
    <div className="w-full">
      <Button
        type="button"
        onClick={handleGoogleOauthLogin}
        disabled={!isLoaded || isRequesting}
        className="w-full flex items-center justify-center gap-2"
      >
        {isRequesting ? "Signing in..." : "Continue with Google"}
      </Button>
    </div>
  );
}
