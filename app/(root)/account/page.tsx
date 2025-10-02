/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  ArrowLeft,
  Shuffle,
  Upload,
  Check,
  CheckCheckIcon,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { useCurrentUser } from "@/context/UserProvider";
import { useEffect, useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { convertedImageUrl } from "@/lib/avatar";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useLocationStore } from "@/stores/uselocationStore";

const accountFormSchema = z.object({
  FullName: z.string(),
  FirstName: z.string(),
  LastName: z.string(),
  BirthDay: z.string(),
  BirthMonth: z.string(),
  BirthYear: z.string(),
  PhoneCode: z.string(),
  PhoneNumber: z.string(),
  Email: z.string(),
  Gender: z.string().optional(),
  Pronoun: z.string().optional(),
  Country: z.string(),
  City: z.string(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

export default function AccountSettings() {
  const { currentUser, refreshUser }: any = useCurrentUser();
  const [otpStep, setOtpStep] = useState<"idle" | "sent" | "verified">("idle");
  const [otpValue, setOtpValue] = useState<string[]>(["", "", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);

  const [phoneOtpStep, setPhoneOtpStep] = useState<
    "idle" | "sent" | "verified"
  >("idle");
  const [phoneOtpValue, setPhoneOtpValue] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [phoneMessage, setPhoneMessage] = useState("");
  const [loadingPhone, setLoadingPhone] = useState(false);
  const [showPhoneOtpInput, setPhoneShowOtpInput] = useState(false);
  // ⚠️ New States for Delete Account
  const [deleteCategory, setDeleteCategory] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      FullName: "",
      FirstName: "",
      LastName: "",
      BirthDay: "",
      BirthMonth: "",
      BirthYear: "",
      PhoneCode: "",
      PhoneNumber: "",
      Email: "",
      Gender: "",
      Pronoun: "",
      Country: "",
      City: "",
    },
  });

  // 1) RESET when currentUser changes
  useEffect(() => {
    if (!currentUser) return; // ← uses Birthday (ISO), not BirthDay/Month/Year

    form.reset({
      FullName: currentUser.FullName ?? "",
      FirstName: currentUser.FirstName ?? "",
      LastName: currentUser.LastName ?? "",

      PhoneCode: "", // UI-only; backend doesn’t use this field
      PhoneNumber: currentUser.PhoneNumber ?? "",
      Email: currentUser.Email ?? "",
      Gender: "",
      Pronoun: "", // if you show text; we’ll map to PronounId on submit
      Country: currentUser.CountryIso2 ?? "", // keep ISO2 so we can send back
      City: currentUser.GiftingPlace?.CityName ?? "",
    });
  }, [currentUser, form]);

  async function handleVerifyEmail() {
    try {
      setLoading(true);
      const res = await fetch("/api/account/email-otp");
      const data = await res.json();

      if (data.success) {
        console.log("✅ OTP sent:", data);
        setOtpStep("sent");
        setShowOtpInput(true);
        toast.success("OTP has been sent to your email.");
      } else {
        console.warn("⚠️ OTP error:", data);
        toast.error(data.message || "Failed to send OTP.");
      }
    } catch (err) {
      console.error("❌ OTP request failed:", err);
      toast.error("Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitOtp() {
    const otp = otpValue.join("");

    if (otp.length !== 4) {
      toast.error("❌ Please enter all 4 digits of OTP.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`/api/account/email-verify?otp=${otp}`);
      const data = await res.json();

      console.log("Verification Result:", data);

      if (res.ok && data?.Success) {
        toast.success(data?.Message || "✅ Email verification complete!");
        setOtpStep("verified");
        setShowOtpInput(false);
      } else {
        toast.error(data?.Message || "❌ Failed to verify OTP.");
      }
    } catch (err: any) {
      console.error("Verify OTP error:", err);
      toast.error(err?.message || "❌ Network error while verifying OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyPhone() {
    try {
      setLoadingPhone(true);
      const res = await fetch("/api/account/phone-otp");
      const data = await res.json();
      console.log("OTP sent:", data);
      setPhoneOtpStep("sent");
      setPhoneShowOtpInput(true);
      setPhoneMessage("OTP has been sent to your phone number.");
    } catch (err) {
      console.error(err);
      setPhoneMessage("Failed to send OTP.");
    } finally {
      setLoadingPhone(false);
    }
  }
  async function handleSubmitPhoneOtp() {
    const otp = otpValue.join("");
    if (otp.length !== 4) {
      setPhoneMessage("Please enter all 4 digits of OTP.");
      return;
    }

    try {
      setLoadingPhone(true);
      const res = await fetch(`/api/account/email-verify?otp=${otp}`);
      const data = await res.json();
      console.log("Verification Result:", data);
      setPhoneMessage(data?.Message || "Email verification complete!");
      setPhoneOtpStep("verified");
      setShowOtpInput(false);
    } catch (err) {
      console.error(err);
      setPhoneMessage("Failed to verify OTP.");
    } finally {
      setLoadingPhone(false);
    }
  }

  // 🗑️ Handle Delete Account
  async function handleDeleteAccount() {
    if (!deleteCategory || !deleteReason) {
      toast.error("Please select a category and enter a reason");
      return;
    }

    setDeleteLoading(true);
    try {
      const res = await fetch(
        `/api/account/delete-account?category=${encodeURIComponent(
          deleteCategory
        )}&reason=${encodeURIComponent(deleteReason)}`,
        { method: "DELETE" }
      );
      const data = await res.json();

      if (data?.Success) {
        toast.success("✅ Account deleted successfully");
      } else {
        toast.error(data?.Message || "Failed to delete account");
      }
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error while deleting account");
    } finally {
      setDeleteLoading(false);
    }
  }

  // update profile
  // Replace your handleUpdateProfile function with this:

  // const handleUpdateProfile = async (values: AccountFormValues) => {
  //   try {
  //     setLoading(true);

  //     // Use the latest currentUser as baseline (already synced via reset)
  //     const baseline: AccountFormValues = form.getValues(); // after reset, this mirrors the UI

  //     // Figure out which fields actually changed (for UX/logging)
  //     const changed: Partial<AccountFormValues> = {};
  //     (Object.keys(values) as (keyof AccountFormValues)[]).forEach((k) => {
  //       if (values[k] !== baseline[k]) changed[k] = values[k];
  //     });

  //     // Merge: send FULL object to avoid server clearing other fields
  //     const fullPayload: AccountFormValues = { ...baseline, ...changed };

  //     // Optional: inspect what you send
  //     console.log("➡️ Update full payload:", fullPayload);

  //     const res = await fetch("/api/account/update-profile", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(fullPayload),
  //       cache: "no-store",
  //     });

  //     const text = await res.text();
  //     const result = text
  //       ? (() => {
  //           try {
  //             return JSON.parse(text);
  //           } catch {
  //             return { Message: text };
  //           }
  //         })()
  //       : {};

  //     if (!res.ok || result?.Success === false) {
  //       toast.error(result?.Message || "Failed to update profile");
  //       return;
  //     }

  //     toast.success(result?.Message || "Profile updated successfully");

  //     // 3) Refresh user (ensure your provider bypasses cache)
  //     await refreshUser?.();

  //     // Reset baseline to the values we just saved
  //     form.reset(values);
  //   } catch (e) {
  //     console.error(e);
  //     toast.error("An error occurred while updating your profile");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleUpdateProfile = async (values: any) => {
    const updateProfileValues: any = {};
    if (values.FullName) updateProfileValues.FullName = values.FullName;
    if (values.FirstName) updateProfileValues.FirstName = values.FirstName;
    if (values.LastName) updateProfileValues.LastName = values.LastName;
    if (values.PhoneNumber)
      updateProfileValues.PhoneNumber = values.PhoneNumber;
    if (values.PhoneCode) updateProfileValues.PhoneCode = values.PhoneCode;
    try {
      const result = await fetch("/api/account/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateProfileValues),
      });
      const res = await result.json();
      if (!result.ok || res?.Success === false) {
        toast.error(res?.Message || "Failed to update profile");
        return;
      }
      toast.success(res?.Message || "Profile updated successfully");
    } catch (error) {
      // console.log(res.data);
      toast.error("An error occurred while updating your profile");
      console.error("Error updating profile:", error);
    }
  };
  const { lat, lng, zoom } = useLocationStore((s) => s.location);
  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      <div>
        Deliver to lat {lat}, lng {lng}
      </div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-semibold">My Account Settings</h1>
      </div>

      {/* Profile Section */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-card p-6 shadow-sm">
        <div className="absolute inset-0 -z-0">
          {/* <Image
            width={80}
            height={80}
            src="/colorful-abstract-geometric-pattern-with-red-yello.jpg"
            alt="Cover"
            className="h-full w-full object-cover"
          /> */}
        </div>

        <div className="relative mb-4 flex justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full bg-black/60 text-white hover:bg-black/70"
          >
            <Shuffle className="mr-2 h-4 w-4" />
            SHUFFLE COVER
          </Button>
        </div>

        <div className="relative flex items-end gap-4">
          <div className="relative">
            <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-muted shadow-lg">
              <Image
                width={80}
                height={80}
                src={
                  convertedImageUrl(currentUser?.Avatar, "md") ||
                  "/default-avatar.png"
                }
                alt="Profile picture"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 pb-2">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full bg-black/60 text-white hover:bg-black/70"
            >
              <Shuffle className="mr-2 h-4 w-4" />
              SHUFFLE PHOTO
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full bg-black/60 text-white hover:bg-black/70"
            >
              <Upload className="mr-2 h-4 w-4" />
              UPLOAD PHOTO
            </Button>
          </div>
        </div>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleUpdateProfile)}
          className="space-y-6"
        >
          <h2 className="text-lg font-semibold text-muted-foreground">
            Basic Details
          </h2>

          {/* Username */}
          <FormField
            control={form.control}
            name="FullName"
            render={({ field }) => (
              <FormItem className="rounded-2xl bg-card p-4 shadow-sm">
                <FormLabel
                  className="text-sm text-muted-foreground"
                  htmlFor="fullName"
                >
                  Fullname
                </FormLabel>
                <FormControl>
                  <Input
                    id="username"
                    {...field}
                    className="mt-1 border-0 bg-transparent p-0 text-base font-medium focus-visible:ring-0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="FirstName"
              render={({ field }) => (
                <FormItem className="rounded-2xl bg-card p-4 shadow-sm">
                  <FormLabel
                    htmlFor="firstName"
                    className="text-sm text-muted-foreground"
                  >
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="firstName"
                      {...field}
                      className="mt-1 border-0 bg-transparent p-0 text-base font-medium focus-visible:ring-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="LastName"
              render={({ field }) => (
                <FormItem className="rounded-2xl bg-card p-4 shadow-sm">
                  <FormLabel htmlFor="lastName" className="sr-only">
                    Last Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="lastName"
                      {...field}
                      className="mt-7 border-0 bg-transparent p-0 text-base font-medium focus-visible:ring-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Birthdate */}
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            <FormLabel className="text-sm text-muted-foreground">
              Birthdate
            </FormLabel>
            <div className="mt-1 flex items-center gap-2">
              {/* Day */}
              <FormField
                control={form.control}
                name="BirthDay"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Day"
                        className="border-0 bg-transparent p-0 text-base font-medium focus-visible:ring-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <span className="text-muted-foreground">|</span>

              {/* Month */}
              <FormField
                control={form.control}
                name="BirthMonth"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="border-0 bg-transparent p-0 text-base font-medium focus-visible:ring-0 shadow-none h-auto">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="January">January</SelectItem>
                          <SelectItem value="February">February</SelectItem>
                          <SelectItem value="March">March</SelectItem>
                          <SelectItem value="April">April</SelectItem>
                          <SelectItem value="May">May</SelectItem>
                          <SelectItem value="June">June</SelectItem>
                          <SelectItem value="July">July</SelectItem>
                          <SelectItem value="August">August</SelectItem>
                          <SelectItem value="September">September</SelectItem>
                          <SelectItem value="October">October</SelectItem>
                          <SelectItem value="November">November</SelectItem>
                          <SelectItem value="December">December</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <span className="text-muted-foreground">|</span>

              {/* Year */}
              <FormField
                control={form.control}
                name="BirthYear"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Year"
                        className="border-0 bg-transparent p-0 text-base font-medium focus-visible:ring-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Your year of birth will remain private; and won&apos;t be shown to
              anyone or publicly
            </p>
          </div>

          {/* Phone */}
          <div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between rounded-full py-2 px-4 bg-card">
                <div className="flex flex-1 items-center gap-2">
                  {/* Country Code */}
                  <FormField
                    control={form.control}
                    name="PhoneCode"
                    render={({ field }) => (
                      <FormItem className="w-20">
                        <FormControl>
                          <Input
                            {...field}
                            className="w-20 border-none shadow-none bg-transparent p-0 text-base font-medium focus-visible:ring-0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <span className="text-muted-foreground">|</span>

                  {/* Phone Number */}
                  <FormField
                    control={form.control}
                    name="PhoneNumber"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            {...field}
                            className="flex-1 border-none shadow-none bg-transparent p-0 text-base font-medium focus-visible:ring-0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  {!currentUser?.PhoneNumberConfirmed &&
                  phoneOtpStep !== "verified" ? (
                    <Button
                      type="button"
                      onClick={handleVerifyPhone}
                      size="sm"
                      variant="default"
                      className="rounded-full bg-primary px-6 py-[10px] text-xs font-semibold uppercase hover:bg-primary/90"
                      disabled={loadingPhone}
                    >
                      {loadingPhone ? "Sending..." : "Verify"}
                    </Button>
                  ) : (
                    <CheckCheckIcon size={14} className="text-green-400" />
                  )}
                </div>
              </div>

              {/* OTP Input */}
              {showPhoneOtpInput && phoneOtpStep === "sent" && (
                <div className="mt-2 flex flex-col items-center gap-2">
                  <InputOTP
                    maxLength={4}
                    value={phoneOtpValue.join("")}
                    onChange={(val: string) => {
                      const digits = val.replace(/\D/g, "");
                      setPhoneOtpValue(digits.split("").slice(0, 4));
                    }}
                  >
                    <InputOTPGroup className="flex gap-2">
                      <InputOTPSlot
                        index={0}
                        className="w-16 h-16 text-2xl text-center border rounded-lg"
                      />
                      <InputOTPSlot
                        index={1}
                        className="w-16 h-16 text-2xl text-center border rounded-lg"
                      />
                      <InputOTPSlot
                        index={2}
                        className="w-16 h-16 text-2xl text-center border rounded-lg"
                      />
                      <InputOTPSlot
                        index={3}
                        className="w-16 h-16 text-2xl text-center border rounded-lg"
                      />
                    </InputOTPGroup>
                  </InputOTP>

                  <Button
                    onClick={handleSubmitPhoneOtp}
                    className="w-full"
                    disabled={loadingPhone}
                  >
                    {loadingPhone ? "Verifying..." : "Submit OTP"}
                  </Button>

                  {phoneMessage && (
                    <p className="text-xs text-muted-foreground text-center">
                      {phoneMessage}
                    </p>
                  )}
                </div>
              )}
            </div>
            {/* (phoneNumber errors already shown via <FormMessage /> above) */}
          </div>

          {/* Email */}
          <FormField
            control={form.control}
            name="Email"
            render={({ field }) => (
              <FormItem className="mx-auto">
                {/* Email Section */}
                <div className="rounded-full bg-card py-2 px-4 flex items-center gap-x-6">
                  <FormLabel
                    htmlFor="email"
                    className="text-sm text-muted-foreground"
                  >
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your email address"
                      id="email"
                      type="email"
                      disabled
                      {...field}
                      className="border-none shadow-none bg-transparent p-0 text-base font-medium focus-visible:ring-0"
                    />
                  </FormControl>

                  {!currentUser?.EmailConfirmed ? (
                    <Button
                      type="button"
                      onClick={handleVerifyEmail}
                      size="sm"
                      variant="default"
                      className="rounded-full bg-primary px-6 py-2 text-xs font-semibold uppercase hover:bg-primary/90"
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Verify"}
                    </Button>
                  ) : (
                    <BadgeCheck size={20} className="text-green-400" />
                  )}
                </div>

                {/* OTP Input */}
                {showOtpInput && otpStep === "sent" && (
                  <div className="mt-4 flex flex-col items-center gap-3">
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={4}
                        value={otpValue.join("")}
                        onChange={(val: string) => {
                          const digits = val.replace(/\D/g, "");
                          setOtpValue(digits.split("").slice(0, 4));
                        }}
                      >
                        <InputOTPGroup className="flex gap-2">
                          <InputOTPSlot
                            index={0}
                            className="w-16 h-16 text-2xl text-center border rounded-lg"
                          />
                          <InputOTPSlot
                            index={1}
                            className="w-16 h-16 text-2xl text-center border rounded-lg"
                          />
                          <InputOTPSlot
                            index={2}
                            className="w-16 h-16 text-2xl text-center border rounded-lg"
                          />
                          <InputOTPSlot
                            index={3}
                            className="w-16 h-16 text-2xl text-center border rounded-lg"
                          />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    <Button
                      className="w-full"
                      onClick={handleSubmitOtp}
                      disabled={loading}
                    >
                      {loading ? "Verifying..." : "Submit OTP"}
                    </Button>

                    {message && (
                      <p className="text-xs text-muted-foreground text-center">
                        {message}
                      </p>
                    )}
                  </div>
                )}

                <FormMessage />
              </FormItem>
            )}
          />

          {/* Gender and Pronoun */}
          {/* <div className="">
            <FormField
              control={form.control}
              name="Pronoun"
              render={({ field }) => (
                <FormItem className="rounded-2xl bg-card p-4 shadow-sm">
                  <FormLabel
                    htmlFor="pronoun"
                    className="text-sm text-muted-foreground"
                  >
                    Pronoun
                  </FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="mt-1 border-0 bg-transparent p-0 text-base font-medium focus-visible:ring-0 shadow-none h-auto">
                        <SelectValue placeholder="Select pronoun" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="He/Him">He/Him</SelectItem>
                        <SelectItem value="She/Her">She/Her</SelectItem>
                        <SelectItem value="They/Them">They/Them</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div> */}

          {/* Country */}
          <FormField
            control={form.control}
            name="Country"
            render={({ field }) => (
              <FormItem className="rounded-2xl bg-card p-4 shadow-sm">
                <FormLabel
                  htmlFor="country"
                  className="text-sm text-muted-foreground"
                >
                  Country You Live?
                </FormLabel>
                <div className="mt-1 flex items-center justify-between">
                  <FormControl>
                    <Input
                      id="country"
                      {...field}
                      className="flex-1 border-0 bg-transparent p-0 text-base font-medium focus-visible:ring-0"
                    />
                  </FormControl>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success">
                    <span className="text-lg">🇧🇩</span>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* City */}
          <FormField
            control={form.control}
            name="City"
            render={({ field }) => (
              <FormItem className="rounded-2xl bg-card p-4 shadow-sm">
                <FormLabel
                  htmlFor="city"
                  className="text-sm text-muted-foreground"
                >
                  Which City?
                </FormLabel>
                <FormControl>
                  <Input
                    id="city"
                    {...field}
                    className="mt-1 border-0 bg-transparent p-0 text-base font-medium focus-visible:ring-0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Update Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full rounded-full bg-primary py-6 text-base font-semibold uppercase text-primary-foreground hover:bg-primary/90"
          >
            <Check className="mr-2 h-5 w-5" />
            Update My Details
          </Button>
        </form>
      </Form>

      {/* 🗑️ Delete Account Section */}
      <div className="mt-10 space-y-4 border-t pt-6">
        <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
        <p className="text-sm text-muted-foreground">
          Deleting your account is permanent and cannot be undone.
        </p>

        {/* Category */}
        <Select onValueChange={setDeleteCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select reason category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="privacy">Privacy Concern</SelectItem>
            <SelectItem value="not-needed">No longer needed</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        {/* Reason */}
        <Input
          placeholder="Write your reason here..."
          value={deleteReason}
          onChange={(e) => setDeleteReason(e.target.value)}
        />

        {/* Delete Button */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleDeleteAccount}
          disabled={deleteLoading}
        >
          {deleteLoading ? "Deleting..." : "Delete Account"}
        </Button>
      </div>
    </div>
  );
}
