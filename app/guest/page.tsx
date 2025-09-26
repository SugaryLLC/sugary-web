/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useTransition } from "react";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import GuestUserProfile from "./GuestUserProfile";
import { createGuest } from "@/actions/auth/CreateGuest";

export default function GuestPage() {
  const [pending, start] = useTransition();

  const handleGuestLogin = async () => {
    start(async () => {
      const result: any = await createGuest();
      if (!result?.success) {
        console.error(result);
        alert(result?.message || "Guest login failed");
        return;
      }
      alert(`Hello ${result.User?.Username ?? "Guest"}!`);
    });
  };

  return (
    <>
      <PrimaryButton onClick={handleGuestLogin} disabled={pending}>
        {pending ? "Please wait…" : "Continue as Guest"}
      </PrimaryButton>
      <GuestUserProfile />
    </>
  );
}
