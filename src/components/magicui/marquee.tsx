"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  speed?: number;
}

export function Marquee({
  children,
  className,
  reverse = false,
  pauseOnHover = false,
  speed = 40,
}: MarqueeProps) {
  return (
    <>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50%)); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(calc(-50%)); }
          100% { transform: translateX(0); }
        }
      `}</style>
      <div
        className={cn(
          "group flex overflow-hidden [--gap:1rem]",
          className,
        )}
      >
        <div
          className={cn(
            "flex shrink-0 items-center gap-[--gap]",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
          )}
          style={{
            animation: `${reverse ? "marquee-reverse" : "marquee"} ${speed}s linear infinite`,
          }}
        >
          {children}
          {children}
        </div>
        <div
          className={cn(
            "flex shrink-0 items-center gap-[--gap]",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
          )}
          style={{
            animation: `${reverse ? "marquee-reverse" : "marquee"} ${speed}s linear infinite`,
          }}
        >
          {children}
          {children}
        </div>
      </div>
    </>
  );
}
