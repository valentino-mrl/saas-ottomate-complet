"use client";

import { cn } from "@/lib/utils";
import React, { useId } from "react";

interface GridPatternProps {
  className?: string;
  width?: number;
  height?: number;
  strokeDasharray?: string;
}

export function GridPattern({
  className,
  width = 40,
  height = 40,
  strokeDasharray = "0",
}: GridPatternProps) {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full stroke-white/10",
        className,
      )}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${width} 0 L 0 0 0 ${height}`}
            fill="none"
            strokeWidth="1"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
    </svg>
  );
}
