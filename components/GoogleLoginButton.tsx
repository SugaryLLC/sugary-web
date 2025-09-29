/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { socialLoginGoogle } from "@/actions/auth/google-login";
import { useCurrentUser } from "@/context/UserProvider";

declare global {
  interface Window {
    google: any;
  }
}

export default function GoogleLoginButton() {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useCurrentUser();
  const guestId = currentUser?.IsGuest;
  useEffect(() => {
    // Load Google Script if not already loaded
    const loadGoogleScript = () => {
      if (window.google) {
        initializeGoogle();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      script.onerror = () => {
        console.error("Failed to load Google Identity Services");
        toast.error("Failed to load Google login");
      };
      document.head.appendChild(script);
    };

    const initializeGoogle = () => {
      if (window.google && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        try {
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          setIsGoogleLoaded(true);

          // Render the button
          const buttonElement = document.getElementById("google-signin-btn");
          if (buttonElement) {
            window.google.accounts.id.renderButton(buttonElement, {
              theme: "outline",
              size: "large",
              width: 350,
              text: "signin_with",
              shape: "rectangular",
              margin: "0 auto"!,
              border_radius: "12",
            });
          }
        } catch (error) {
          console.error("Google initialization error:", error);
          toast.error("Failed to initialize Google login");
        }
      }
    };

    loadGoogleScript();
  });

  async function handleCredentialResponse(response: any) {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const idToken = response.credential; // JWT from Google

      // Decode the JWT to get user info (optional - for displaying user data)
      const payload = JSON.parse(atob(idToken.split(".")[1]));

      const result = await socialLoginGoogle({
        Provider: "google",
        Token: idToken,
        FirstName: currentUser?.FirstName,
        LastName: currentUser?.LastName,
        GuestUserId: currentUser?.Id,
      });

      if (result.success) {
        toast.success("✅ Google login successful");
        console.log("Google user:", result.user);

        // Redirect or update UI
        window.location.href = "/"; // or use Next.js router
      } else {
        toast.error(result.message || "Google login failed");
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      toast.error(error.message || "Google login failed");
    } finally {
      setIsLoading(false);
    }
  }

  // function getGuestUserId(): string | undefined {
  //   if (typeof window !== "undefined") {
  //     try {
  //       return localStorage.getItem("guestUserId") || undefined;
  //     } catch {
  //       return undefined;
  //     }
  //   }
  //   return undefined;
  // }

  const handleFallbackClick = () => {
    if (!isGoogleLoaded) {
      toast.error("Google services are still loading...");
      return;
    }

    // Trigger Google One Tap
    window.google?.accounts.id.prompt();
  };

  return (
    <div className="w-full space-y-3">
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      {/* Google Identity button renders here */}
      <div className="w-full r">
        <div
          id="google-signin-btn"
          className="w-full [&>div]:w-full [&>div]:justify-center"
        />
      </div>

      {/* Fallback button for when Google button doesn't load */}
      {!isGoogleLoaded && (
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={handleFallbackClick}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
        </Button>
      )}
    </div>
  );
}
