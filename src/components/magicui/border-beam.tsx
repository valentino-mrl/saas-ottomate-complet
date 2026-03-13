"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
}

export function BorderBeam({
  className,
  size = 200,
  duration = 15,
  delay = 0,
  colorFrom = "#6366f1",
  colorTo = "#8b5cf6",
}: BorderBeamProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit]",
        className,
      )}
      style={{
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes border-beam {
          0% { offset-distance: 0%; }
          100% { offset-distance: 100%; }
        }
      `}</style>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          maskImage: "linear-gradient(transparent, transparent), linear-gradient(#fff, #fff)",
          maskComposite: "exclude",
          WebkitMaskComposite: "destination-out",
          maskClip: "padding-box, border-box",
          WebkitMaskImage: "linear-gradient(transparent, transparent), linear-gradient(#fff, #fff)",
          padding: "1px",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: `${size}px`,
            height: `${size}px`,
            background: `conic-gradient(from 0deg, transparent 0%, ${colorFrom} 30%, ${colorTo} 70%, transparent 100%)`,
            offsetPath: `rect(0 100% 100% 0 round ${size}px)`,
            animation: `border-beam ${duration}s linear ${delay}s infinite`,
            opacity: 0.8,
          }}
        />
      </div>
    </div>
  );
}
