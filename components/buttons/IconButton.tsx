"use client";

import React, { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  size?: "sm" | "md" | "lg";
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = "md",
  className,
  ...props
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 p-1",
    md: "w-10 h-10 p-2",
    lg: "w-12 h-12 p-3",
  };

  return (
    <Button
      className={cn(
        "cursor-pointer inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {icon}
    </Button>
  );
};
