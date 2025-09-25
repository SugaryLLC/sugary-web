"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CustomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const CustomModal: React.FC<CustomModalProps> = ({
  open,
  onOpenChange,
  trigger,
  children,
  className,
}) => {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      {trigger && <PopoverTrigger asChild>{trigger}</PopoverTrigger>}
      <PopoverContent
        align="center"
        side="bottom"
        className={cn(
          "p-4 rounded-2xl bg-white dark:bg-neutral-800 shadow-lg border border-gray-200 dark:border-neutral-700 w-80 max-w-[90vw] transition-all",
          className
        )}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
};
