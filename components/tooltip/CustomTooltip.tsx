"use client";

import React, { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

interface CustomTooltipProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  title,
  description,
  icon,
  children,
  className,
}) => {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}

      {show && (
        <div
          className={cn(
            "absolute bottom-full left-1/2 -translate-x-1/2 mb-3 min-w-64 z-50 transition-all duration-300 ease-out",
            className
          )}
        >
          <div className="relative p-4 bg-gray-900/95 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg text-white">
            <div className="flex items-center gap-3 mb-2">
              {icon && (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20">
                  {icon}
                </div>
              )}
              <h3 className="text-sm font-semibold">{title}</h3>
            </div>
            {description && (
              <p className="text-[10px] text-gray-300">{description}</p>
            )}

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-xl opacity-50 pointer-events-none"></div>

            {/* Tooltip arrow */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900/95 rotate-45 border-r border-b border-white/10"></div>
          </div>
        </div>
      )}
    </div>
  );
};
