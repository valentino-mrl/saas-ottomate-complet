"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useMemo, useState } from "react";

interface SparkleData {
  id: number;
  x: string;
  y: string;
  size: number;
  delay: number;
  color: string;
}

interface SparklesTextProps {
  text: string;
  className?: string;
  sparklesCount?: number;
  colors?: { first: string; second: string };
}

function Sparkle({ x, y, size, delay, color }: Omit<SparkleData, "id">) {
  return (
    <svg
      className="pointer-events-none absolute"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        animation: `sparkle-spin 2s linear infinite, sparkle-fade 2s ease-in-out ${delay}s infinite`,
      }}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z"
        fill={color}
      />
    </svg>
  );
}

export function SparklesText({
  text,
  className,
  sparklesCount = 3,
  colors = { first: "#6366f1", second: "#8b5cf6" },
}: SparklesTextProps) {
  const [sparkles, setSparkles] = useState<SparkleData[]>([]);

  const generateSparkles = useMemo(() => {
    return Array.from({ length: sparklesCount }, (_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      size: Math.random() * 10 + 8,
      delay: Math.random() * 2,
      color: i % 2 === 0 ? colors.first : colors.second,
    }));
  }, [sparklesCount, colors.first, colors.second]);

  useEffect(() => {
    setSparkles(generateSparkles);

    const interval = setInterval(() => {
      setSparkles(
        Array.from({ length: sparklesCount }, (_, i) => ({
          id: i,
          x: `${Math.random() * 100}%`,
          y: `${Math.random() * 100}%`,
          size: Math.random() * 10 + 8,
          delay: Math.random() * 2,
          color: i % 2 === 0 ? colors.first : colors.second,
        })),
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [sparklesCount, colors.first, colors.second, generateSparkles]);

  return (
    <>
      <style>{`
        @keyframes sparkle-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(180deg); }
        }
        @keyframes sparkle-fade {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <span className={cn("relative inline-block", className)}>
        {sparkles.map((sparkle) => (
          <Sparkle key={sparkle.id} {...sparkle} />
        ))}
        <span className="relative z-10">{text}</span>
      </span>
    </>
  );
}
