"use client";

import type React from "react";
import { type Dispatch, type SetStateAction, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoginForm from "@/app/auth/LoginForm";
import { SignUpForm } from "@/app/auth/SignUpForm";

export function FormTab() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  return (
    <Card className="w-full max-w-md mx-auto border-none bg-transparent shadow-none">
      <CardHeader className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-semibold text-foreground">Sugary</span>
        </div>
        <div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {activeTab === "login" ? "Welcome back" : "Create account"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {activeTab === "login"
              ? "Sign in to your account to continue"
              : "Sign up to get started with AuthApp"}
          </CardDescription>
        </div>
        <AuthTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </CardHeader>
      <CardContent>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === "login" ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeTab === "login" ? 20 : -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {activeTab === "login" ? <LoginForm /> : <SignUpForm />}
        </motion.div>
      </CardContent>
    </Card>
  );
}

const AuthTabs = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: "login" | "signup";
  setActiveTab: Dispatch<SetStateAction<"login" | "signup">>;
}) => {
  const [position, setPosition] = useState<Position>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  return (
    <ul className="relative mx-auto flex w-fit rounded-full border-2 border-border bg-muted p-1">
      <Tab
        setPosition={setPosition}
        isActive={activeTab === "login"}
        onClick={() => setActiveTab("login")}
      >
        Login
      </Tab>
      <Tab
        setPosition={setPosition}
        isActive={activeTab === "signup"}
        onClick={() => setActiveTab("signup")}
      >
        Sign Up
      </Tab>
      <Cursor position={position} />
    </ul>
  );
};

const Tab = ({
  children,
  setPosition,
  isActive,
  onClick,
}: {
  children: string;
  setPosition: Dispatch<SetStateAction<Position>>;
  isActive: boolean;
  onClick: () => void;
}) => {
  const ref = useRef<null | HTMLLIElement>(null);

  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref?.current) return;

        const { width } = ref.current.getBoundingClientRect();

        setPosition({
          left: ref.current.offsetLeft,
          width,
          opacity: 1,
        });
      }}
      onClick={onClick}
      className={`relative z-10 block cursor-pointer px-6 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "text-primary-foreground mix-blend-difference"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </li>
  );
};

const Cursor = ({ position }: { position: Position }) => {
  return (
    <motion.li
      animate={{
        ...position,
      }}
      className="absolute z-0 h-[35px] rounded-full bg-primary"
    />
  );
};

type Position = {
  left: number;
  width: number;
  opacity: number;
};
