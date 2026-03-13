"use client";

import { cn } from "@/lib/utils";
import React, { useCallback, useRef, useState } from "react";

interface MagicCardProps {
  children: React.ReactNode;
  className?: string;
  gradientColor?: string;
  gradientSize?: number;
}

export function MagicCard({
  children,
  className,
  gradientColor = "rgba(99,102,241,0.15)",
  gradientSize = 200,
}: MagicCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!divRef.current) return;
      const rect = divRef.current.getBoundingClientRect();
      setPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    [],
  );

  const handleMouseEnter = useCallback(() => {
    setOpacity(1);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setOpacity(0);
  }, []);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(${gradientSize}px circle at ${position.x}px ${position.y}px, ${gradientColor}, transparent 60%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
