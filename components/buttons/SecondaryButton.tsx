import React, { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils"; // or "classnames" if installed
import { Button } from "../ui/button";

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  asChild?: boolean;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  icon,
  iconPosition = "left",
  className,
  asChild,
  ...props
}) => {
  return (
    <Button
      asChild={asChild}
      className={cn(
        "bg-gray-200 text-gray-800 cursor-pointer text-[12px] px-4 py-2 rounded-md shadow hover:bg-gray-300 transition-colors duration-200 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600 flex items-center gap-2",
        className
      )}
      {...props}
    >
      <>
        <span>{icon && iconPosition === "left" && icon}</span>
        <span>{children}</span>
        <span>{icon && iconPosition === "right" && icon}</span>
      </>
    </Button>
  );
};
