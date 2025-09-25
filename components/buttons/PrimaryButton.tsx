import React, { ButtonHTMLAttributes } from "react";
import cn from "classnames";
import { Button } from "../ui/button";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  asChild?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  className,
  icon,
  iconPosition = "left",
  asChild,
  ...props
}) => {
  return (
    <Button
      asChild={asChild}
      className={cn(
        "bg-[#5D2F77] cursor-pointer text-white text-[12px] px-4 py-2 rounded-md shadow hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2",
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
