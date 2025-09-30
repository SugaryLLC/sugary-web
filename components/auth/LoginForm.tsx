/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { useCurrentUser } from "@/context/UserProvider";
import AppleLoginButton from "../AppleLoginButton";

const loginSchema = z.object({
  UserName: z.string().email("Invalid email"),
  Password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { refreshUser, currentUser } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      UserName: "",
      Password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        body: JSON.stringify(values),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        await refreshUser();
        console.log("✅ Logged in:", result);
        toast("Logged in successfully.");
      } else {
        setError(result.message || "Login failed");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    }

    setLoading(false);
  }
  const handleForgotPassword = async () => {
    const email = currentUser?.Email;
    const res = await fetch(`/api/auth/forgot-pass?email=${email}`);
    const data = await res.json();
    toast(data.Message);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <FormField
          control={form.control}
          name="UserName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  {...field}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="Password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  {...field}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center space-x-2 text-muted-foreground">
            <input type="checkbox" className="rounded border-border" />
            <span>Remember me</span>
          </label>
          <a
            onClick={handleForgotPassword}
            className="text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {"Don't have an account? "}
          <span className="text-primary cursor-pointer hover:text-primary/80">
            Sign up here
          </span>
        </p>
        {/* Google Identity Services SDK */}
        <GoogleLoginButton />
        <AppleLoginButton />
      </form>
    </Form>
  );
}
