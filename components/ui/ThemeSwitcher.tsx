/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Sun, Moon, Palette } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeProvider";

type Props = { className?: string };
type Theme = "light" | "dark" | "blue";

const themes: { value: Theme; icon: React.ComponentType<any> }[] = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "blue", icon: Palette },
];

export const ThemeSwitcher = ({ className }: Props) => {
  const { theme, setTheme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Update currentIndex if theme changes elsewhere
  useEffect(() => {
    const idx = themes.findIndex((t) => t.value === theme);
    if (idx >= 0) setCurrentIndex(idx);
  }, [theme]);

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return;

    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme: Theme = themes[nextIndex].value;

    // Animate theme change
    await document.startViewTransition(() => {
      flushSync(() => {
        setCurrentIndex(nextIndex);
        setTheme(nextTheme);
        document.documentElement.classList.remove(
          ...themes.map((t) => t.value)
        );
        document.documentElement.classList.add(nextTheme);
        localStorage.setItem("theme", nextTheme);
      });
    }).ready;

    // Clip-path animation
    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top)
    );

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 700,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  }, [currentIndex, setTheme]);

  const CurrentIcon = themes[currentIndex].icon;

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(
        "p-2 rounded-full bg-gray-100 dark:bg-neutral-700 transition-colors duration-300",
        className
      )}
    >
      <CurrentIcon className="h-5 w-5 text-[var(--text)]" />
    </button>
  );
};
