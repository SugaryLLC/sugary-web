/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { convertedImageUrl } from "@/lib/avatar";
import { User, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";

export function UserProfile({ user }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div className="cursor-pointer group flex items-center gap-3 px-4 py-2.5 h-auto rounded-full hover:bg-accent/80 hover:backdrop-blur-sm transition-all duration-300 ease-out hover:shadow-lg hover:scale-[1.02] border border-transparent hover:border-border/50">
          <Avatar className="h-9 w-9 ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-300">
            <AvatarImage
              src={convertedImageUrl(user?.Avatar, "md") || undefined}
              alt={user?.FullName || "User"}
            />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-semibold">
              {user?.Username}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start text-left">
            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
              {user?.FullName}
            </span>
            <span className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-200">
              {user?.email}
            </span>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-all duration-300 ease-out ${
              isOpen ? "rotate-180 text-primary" : "group-hover:text-foreground"
            }`}
          />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 p-2 animate-in slide-in-from-top-2 fade-in-0 duration-200 border border-border/50 shadow-xl backdrop-blur-sm bg-background/95"
        sideOffset={8}
      >
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors duration-200">
          <Avatar className="h-10 w-10 ring-2 ring-primary/10">
            <AvatarImage
              src={convertedImageUrl(user?.Avatar, "md") || undefined}
              alt={user?.FullName || "User"}
            />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-semibold">
              {user?.Username}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              {user?.FullName}
            </span>
            <span className="text-xs text-muted-foreground">{user?.email}</span>
          </div>
        </div>

        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem
          className="cursor-pointer rounded-lg p-3 transition-all duration-200 group
             hover:bg-gray-100 text-foreground"
        >
          <User className="mr-3 h-4 w-4 text-muted-foreground group-text-primary transition-colors duration-200" />
          <span className="font-medium text-[var(--primary)]">My Account</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="hover:bg-gray-100 cursor-pointer rounded-lg p-3 transition-all duration-200 group
             "
        >
          <LogOut className="mr-3 h-4 w-4 group-scale-110 transition-transform duration-200" />
          <span className="font-medium">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
