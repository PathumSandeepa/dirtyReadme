"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "cn";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}

/** Scroll reveal (opacity and 16px rise, 500ms ease-out, once per element) with optional stagger in ms. */
export function Reveal({ children, className, stagger = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      queueMicrotask(() => setVisible(true));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-visible={visible ? "true" : "false"}
      style={stagger > 0 ? { transitionDelay: `${stagger}ms` } : undefined}
      className={cn("home-reveal-v2", className)}
    >
      {children}
    </div>
  );
}
