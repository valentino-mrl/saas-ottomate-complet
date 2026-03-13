"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface AnimatedGradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedGradientText({
  children,
  className,
}: AnimatedGradientTextProps) {
  return (
    <>
      <style>{`
        @keyframes animated-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <span
        className={cn(
          "inline-flex bg-clip-text text-transparent",
          "[-webkit-background-clip:text]",
          className,
        )}
        style={{
          backgroundImage:
            "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa, #8b5cf6, #6366f1)",
          backgroundSize: "300% 100%",
          animation: "animated-gradient 4s ease infinite",
        }}
      >
        {children}
      </span>
    </>
  );
}
