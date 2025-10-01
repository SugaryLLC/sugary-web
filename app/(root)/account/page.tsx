/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  ArrowLeft,
  Shuffle,
  Upload,
  Check,
  CheckCheck,
  CheckCheckIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { convertedImageUrl } from "@/lib/avatar";

const accountFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  birthDay: z.string(),
  birthMonth: z.string(),
  birthYear: z.string(),
  phoneCode: z.string(),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  gender: z.string().optional(),
  pronoun: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

export default function AccountSettings() {
  const { currentUser }: any = useCurrentUser();
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
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      username: "rafid541",
      firstName: "Rafid",
      lastName: "Parker",
      birthDay: "",
      birthMonth: "September",
      birthYear: "",
      phoneCode: "+880",
      phoneNumber: "1717-056295",
      email: "mostafararafid45@gmail.com",
      gender: "Male",
      pronoun: "He/Him",
      country: "Bangladesh",
      city: "Dhaka",
    },
  });

  async function handleVerifyEmail() {
    try {
      setLoading(true);
      const res = await fetch("/api/account/email-otp");
      const data = await res.json();
      console.log("OTP sent:", data);
      setOtpStep("sent");
      setShowOtpInput(true);
      setMessage("OTP has been sent to your email.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitOtp() {
    const otp = otpValue.join("");
    if (otp.length !== 6) {
      setMessage("Please enter all 6 digits of OTP.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/account/email-verify?otp=${otp}`);
      const data = await res.json();
      console.log("Verification Result:", data);
      setMessage(data?.Message || "Email verification complete!");
      setOtpStep("verified");
      setShowOtpInput(false);
    } catch (err) {
      console.error(err);
      setMessage("Failed to verify OTP.");
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
    if (otp.length !== 6) {
      setPhoneMessage("Please enter all 6 digits of OTP.");
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
  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
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

      <form className="space-y-6">
        <h2 className="text-lg font-semibold text-muted-foreground">
          Basic Details
        </h2>

        {/* Username */}
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <Label htmlFor="username" className="text-sm text-muted-foreground">
            Username
          </Label>
          <Input
            id="username"
            {...form.register("username")}
            className="mt-1 border-0 bg-transparent p-0 text-base font-medium focus-visible:ring-0"
          />
          {form.formState.errors.username && (
            <p className="mt-1 text-sm text-destructive">
              {form.formState.errors.username.message}
            </p>
          )}
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            <Label
              htmlFor="firstName"
              className="text-sm text-muted-foreground"
            >
              Name
            </Label>
            <Input
              id="firstName"
              {...form.register("firstName")}
              className="mt-1 border-0 bg-transparent p-0 text-base font-medium focus-visible:ring-0"
            />
            {form.formState.errors.firstName && (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.firstName.message}
              </p>
            )}
          </div>
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            <Label htmlFor="lastName" className="sr-only">
              Last Name
            </Label>
            <Input
              id="lastName"
              {...form.register("lastName")}
              className="mt-7 border-0 bg-transparent p-0 text-base font-medium focus-visible:ring-0"
            />
            {form.formState.errors.lastName && (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Birthdate */}
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <Label className="text-sm text-muted-foreground">Birthdate</Label>
          <div className="mt-1 flex items-center gap-2">
            <Input
              {...form.register("birthDay")}
              placeholder="Day"
              className="flex-1 border-0 bg-transparent p-0 text-base font-medium focus-visible:ring-0"
            />
            <span className="text-muted-foreground">|</span>
            <Select
              value={form.watch("birthMonth")}
              onValueChange={(value) => form.setValue("birthMonth", value)}
            >
              <SelectTrigger className="flex-1 border-0 bg-transparent p-0 text-base font-medium focus-visible:ring-0 shadow-none h-auto">
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
            <span className="text-muted-foreground">|</span>
            <Input
              {...form.register("birthYear")}
              placeholder="Year"
              className="flex-1 border-0 bg-transparent p-0 text-base font-medium focus-visible:ring-0"
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Your year of birth will remain private; and won&apos;t be shown to
            anyone or publicly
          </p>
        </div>

        {/* Phone */}
        <div className="rounded-full bg-card py-2 px-4">
          <div className="flex flex-col gap-2 bg-card">
            <div className="flex items-center justify-between">
              <div className="flex flex-1 items-center gap-2">
                {/* Country Code */}
                <Input
                  {...form.register("phoneCode")}
                  className="w-20 border-none shadow-none bg-transparent p-0 text-base font-medium focus-visible:ring-0"
                />
                <span className="text-muted-foreground">|</span>

                {/* Phone Number */}
                <Input
                  {...form.register("phoneNumber")}
                  className="flex-1 border-none shadow-none bg-transparent p-0 text-base font-medium focus-visible:ring-0"
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
                  maxLength={6}
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
                  </InputOTPGroup>
                  <InputOTPSeparator className="w-4" />
                  <InputOTPGroup className="flex gap-2">
                    <InputOTPSlot
                      index={3}
                      className="w-16 h-16 text-2xl text-center border rounded-lg"
                    />
                    <InputOTPSlot
                      index={4}
                      className="w-16 h-16 text-2xl text-center border rounded-lg"
                    />
                    <InputOTPSlot
                      index={5}
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
          {form.formState.errors.phoneNumber && (
            <p className="mt-1 text-sm text-destructive">
              {form.formState.errors.phoneNumber.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="mx-auto">
          {/* Email Section */}
          <div className="rounded-full bg-card py-2 px-4 flex items-center gap-x-6">
            <Label htmlFor="email" className="text-sm text-muted-foreground">
              Email
            </Label>
            <Input
              placeholder="Your email address"
              id="email"
              type="email"
              value={currentUser?.Email || ""}
              disabled
              className="border-none shadow-none bg-transparent p-0 text-base font-medium focus-visible:ring-0"
            />

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
              <CheckCheckIcon size={14} className="text-green-400" />
            )}
          </div>

          {/* OTP Input */}
          {/* OTP Input */}
          {showOtpInput && otpStep === "sent" && (
            <div className="mt-4 flex flex-col items-center gap-3">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otpValue.join("")}
                  onChange={(val: string) => {
                    const digits = val.replace(/\D/g, "");
                    setOtpValue(digits.split("").slice(0, 6));
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
                  </InputOTPGroup>
                  <InputOTPSeparator className="w-4" />
                  <InputOTPGroup className="flex gap-2">
                    <InputOTPSlot
                      index={3}
                      className="w-16 h-16 text-2xl text-center border rounded-lg"
                    />
                    <InputOTPSlot
                      index={4}
                      className="w-16 h-16 text-2xl text-center border rounded-lg"
                    />
                    <InputOTPSlot
                      index={5}
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
        </div>

        {/* Gender and Pronoun */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            <Label htmlFor="gender" className="text-sm text-muted-foreground">
              Gender
            </Label>
            <Select
              value={form.watch("gender")}
              onValueChange={(value) => form.setValue("gender", value)}
            >
              <SelectTrigger className="mt-1 border-0 bg-transparent p-0 text-base font-medium focus-visible:ring-0 shadow-none h-auto">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Prefer not to say">
                  Prefer not to say
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            <Label htmlFor="pronoun" className="text-sm text-muted-foreground">
              Pronoun
            </Label>
            <Select
              value={form.watch("pronoun")}
              onValueChange={(value) => form.setValue("pronoun", value)}
            >
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
          </div>
        </div>

        {/* Country */}
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <Label htmlFor="country" className="text-sm text-muted-foreground">
            Country You Live?
          </Label>
          <div className="mt-1 flex items-center justify-between">
            <Input
              id="country"
              {...form.register("country")}
              className="flex-1 border-0 bg-transparent p-0 text-base font-medium focus-visible:ring-0"
            />
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success">
              <span className="text-lg">🇧🇩</span>
            </div>
          </div>
          {form.formState.errors.country && (
            <p className="mt-1 text-sm text-destructive">
              {form.formState.errors.country.message}
            </p>
          )}
        </div>

        {/* City */}
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <Label htmlFor="city" className="text-sm text-muted-foreground">
            Which City?
          </Label>
          <Input
            id="city"
            {...form.register("city")}
            className="mt-1 border-0 bg-transparent p-0 text-base font-medium focus-visible:ring-0"
          />
          {form.formState.errors.city && (
            <p className="mt-1 text-sm text-destructive">
              {form.formState.errors.city.message}
            </p>
          )}
        </div>

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
    </div>
  );
}
