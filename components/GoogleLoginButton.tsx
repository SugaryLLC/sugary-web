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
  const { currentUser, refreshUser } = useCurrentUser() as any;
  const router = useRouter();

  // Scopes for additional profile data
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
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: async (tokenResponse: any) => {
          try {
            if (!tokenResponse || !tokenResponse.access_token) {
              console.error("No access token received", tokenResponse);
              toast.error("Failed to get Google access token");
              setIsRequesting(false);
              return;
            }

            const accessToken = tokenResponse.access_token;

            // Fetch complete profile info from Google People API
            const peopleRes = await fetch(
              "https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos,genders,birthdays",
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            );

            if (!peopleRes.ok) {
              throw new Error("Failed to fetch profile from Google People API");
            }

            const peopleData = await peopleRes.json();
            console.log("Google People API full response:", peopleData);

            // Extract profile information with proper null checking
            // Names array contains objects with givenName and familyName
            const primaryName =
              peopleData.names?.find((n: any) => n.metadata?.primary) ||
              peopleData.names?.[0];
            const firstName = primaryName?.givenName || "";
            const lastName = primaryName?.familyName || "";

            // Photos array contains objects with url property
            const primaryPhoto =
              peopleData.photos?.find((p: any) => p.metadata?.primary) ||
              peopleData.photos?.[0];
            const avatar = primaryPhoto?.url || "";

            // Email addresses
            const primaryEmail =
              peopleData.emailAddresses?.find(
                (e: any) => e.metadata?.primary
              ) || peopleData.emailAddresses?.[0];
            const email = primaryEmail?.value || "";

            console.log("Extracted profile:", {
              firstName,
              lastName,
              avatar,
              email,
            });

            const payload = {
              Provider: "google",
              Token: accessToken,
              GuestUserId: currentUser?.Id,
              IsWeb: true,
              FirstName: firstName,
              LastName: lastName,
              Avatar: avatar,
              // Add these if your backend supports them
              // Email: email,
              // Gender: gender,
              // Birthday: birthday,
            };

            console.log("Sending payload to backend:", payload);

            // Verify data before sending
            if (!firstName || !lastName) {
              console.warn(
                "⚠️ Missing name data from Google. Check API response."
              );
            }
            if (!avatar) {
              console.warn(
                "⚠️ Missing avatar from Google. Check API response."
              );
            }

            // Call your server action
            const result = await socialLoginGoogle(payload);

            if (result?.success) {
              toast.success("✅ Logged in with Google");

              if (typeof refreshUser === "function") {
                await refreshUser();
                router.push("/");
              } else {
                window.location.href = "/";
              }
            } else {
              console.error("socialLoginGoogle failed:", result);
              toast.error(result?.message || "Google sign-in failed");
            }
          } catch (err: any) {
            console.error("Google People API / social login error:", err);
            toast.error(err?.message || "Google sign-in failed");
          } finally {
            setIsRequesting(false);
          }
        },
      });

      // Request access token with consent prompt to ensure all scopes are granted
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
