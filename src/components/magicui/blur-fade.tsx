"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useInView } from "framer-motion";
import React, { useRef } from "react";

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  inView?: boolean;
}

export function BlurFade({
  children,
  className,
  delay = 0,
  duration = 0.4,
  yOffset = 6,
  inView: inViewProp = true,
}: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });
  const shouldAnimate = inViewProp ? isInView : true;

  const variants = {
    hidden: {
      opacity: 0,
      y: yOffset,
      filter: "blur(6px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={shouldAnimate ? "visible" : "hidden"}
        exit="hidden"
        variants={variants}
        transition={{
          delay,
          duration,
          ease: "easeOut",
        }}
        className={cn(className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
