"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface ShimmerButtonProps {
  children: React.ReactNode;
  className?: string;
  shimmerColor?: string;
  shimmerSize?: string;
  background?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
}

export function ShimmerButton({
  children,
  className,
  shimmerColor = "#6366f1",
  shimmerSize = "0.1em",
  background = "rgba(99,102,241,0.1)",
  onClick,
  type = "button",
}: ShimmerButtonProps) {
  return (
    <>
      <style>{`
        @keyframes shimmer-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes spin-around {
          0% { transform: translateZ(0) rotate(0deg); }
          100% { transform: translateZ(0) rotate(360deg); }
        }
      `}</style>
      <button
        type={type}
        onClick={onClick}
        className={cn(
          "group relative inline-flex items-center justify-center overflow-hidden rounded-lg px-6 py-3",
          "text-sm font-medium text-white transition-all duration-300",
          "hover:scale-[1.02] active:scale-[0.98]",
          className,
        )}
        style={{ background }}
      >
        {/* Shimmer overlay */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[inherit]"
          style={{ padding: shimmerSize }}
        >
          <div
            className="absolute inset-[-100%]"
            style={{
              background: `conic-gradient(from 0deg, transparent 0%, ${shimmerColor} 10%, transparent 20%)`,
              animation: "spin-around 3s linear infinite",
            }}
          />
        </div>

        {/* Background fill */}
        <div
          className="absolute inset-px rounded-[calc(inherit-1px)]"
          style={{ background }}
        />

        {/* Shine sweep */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(120deg, transparent 30%, ${shimmerColor}33 50%, transparent 70%)`,
            animation: "shimmer-slide 3s ease-in-out infinite",
          }}
        />

        <span className="relative z-10">{children}</span>
      </button>
    </>
  );
}
