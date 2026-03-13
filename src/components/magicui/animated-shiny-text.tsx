"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface AnimatedShinyTextProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedShinyText({ children, className }: AnimatedShinyTextProps) {
  return (
    <span
      className={cn(
        "inline-flex animate-shiny-text bg-clip-text",
        "bg-[length:400%_100%]",
        "bg-gradient-to-r from-transparent via-white/80 to-transparent",
        "[-webkit-background-clip:text]",
        className,
      )}
      style={{
        animationDuration: "3s",
        animationIterationCount: "infinite",
        animationTimingFunction: "linear",
        backgroundSize: "400% 100%",
        animation: "shiny-text 3s linear infinite",
      }}
    >
      <style>{`
        @keyframes shiny-text {
          0% { background-position: 100% 50%; }
          100% { background-position: -100% 50%; }
        }
      `}</style>
      {children}
    </span>
  );
}
