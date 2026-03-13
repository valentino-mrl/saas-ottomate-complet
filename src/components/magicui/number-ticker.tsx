"use client";

import { cn } from "@/lib/utils";
import {
  useMotionValue,
  useTransform,
  animate,
  motion,
  useInView,
} from "framer-motion";
import React, { useEffect, useRef } from "react";

interface NumberTickerProps {
  value: number;
  className?: string;
  delay?: number;
  decimalPlaces?: number;
}

export function NumberTicker({
  value,
  className,
  delay = 0,
  decimalPlaces = 0,
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) =>
    latest.toFixed(decimalPlaces),
  );
  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (!isInView) return;

    const timeout = setTimeout(() => {
      const controls = animate(motionValue, value, {
        duration: 2,
        ease: "easeOut",
      });
      return controls.stop;
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [motionValue, value, delay, isInView]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = latest;
      }
    });
    return unsubscribe;
  }, [rounded]);

  return (
    <motion.span
      ref={ref}
      className={cn(
        "inline-block tabular-nums tracking-wider",
        className,
      )}
    >
      0
    </motion.span>
  );
}
