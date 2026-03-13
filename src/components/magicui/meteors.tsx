"use client";

import { cn } from "@/lib/utils";
import React, { useMemo } from "react";

interface MeteorsProps {
  number?: number;
  className?: string;
}

export function Meteors({ number = 20, className }: MeteorsProps) {
  const meteors = useMemo(() => {
    return Array.from({ length: number }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 50 - 50}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 3 + 2}s`,
      size: Math.random() * 1 + 0.5,
    }));
  }, [number]);

  return (
    <>
      <style>{`
        @keyframes meteor-fall {
          0% {
            transform: translateY(0) translateX(0) rotate(215deg);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translateY(300px) translateX(-300px) rotate(215deg);
            opacity: 0;
          }
        }
      `}</style>
      {meteors.map((meteor) => (
        <span
          key={meteor.id}
          className={cn(
            "pointer-events-none absolute rounded-full bg-slate-300",
            className,
          )}
          style={{
            left: meteor.left,
            top: meteor.top,
            width: `${meteor.size}px`,
            height: `${meteor.size * 80}px`,
            background: `linear-gradient(to bottom, rgba(99,102,241,0.8), transparent)`,
            animation: `meteor-fall ${meteor.duration} linear ${meteor.delay} infinite`,
            transform: "rotate(215deg)",
          }}
        >
          {/* Head of meteor */}
          <span
            className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
            style={{
              width: `${meteor.size * 3}px`,
              height: `${meteor.size * 3}px`,
              background: "rgba(139,92,246,0.9)",
              boxShadow: "0 0 8px 2px rgba(99,102,241,0.4)",
            }}
          />
        </span>
      ))}
    </>
  );
}
