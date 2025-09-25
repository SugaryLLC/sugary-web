"use client";

import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import React from "react";

const GuestLogin = () => {
  const handleGuestLogin = async () => {
    try {
      const res = await fetch("/api/guest", { method: "POST" });
      if (res.ok) {
        alert("Guest login successful");
        return;
      }
    } catch (error) {
      console.error(error, "failed to login as guest");
    }
  };
  return (
    <div>
      <PrimaryButton onClick={handleGuestLogin}>Guest login</PrimaryButton>
    </div>
  );
};

export default GuestLogin;
