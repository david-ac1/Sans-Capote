"use client";

import React, { useState, useRef, useEffect } from "react";
import { DynamicTextSlider } from "./dynamic-text-slider";

interface InteractiveTextProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Component that wraps text and makes it interactive with a slider
 */
export function InteractiveText({ children, className = "" }: InteractiveTextProps) {
  const measureRef = useRef<HTMLSpanElement>(null);
  const [textWidth, setTextWidth] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (measureRef.current) {
        setTextWidth(measureRef.current.clientWidth);
      }
    };
    
    measure();
    window.addEventListener("resize", measure);
    
    const ro = new ResizeObserver(measure);
    if (measureRef.current) ro.observe(measureRef.current);
    
    return () => {
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, [children]);

  return (
    <>
      {/* Hidden measurement copy */}
      <span
        ref={measureRef}
        className={`absolute -left-[9999px] whitespace-nowrap ${className}`}
        aria-hidden="true"
      >
        {children}
      </span>
      
      {/* Visible interactive slider */}
      <span className="inline-block">
        <DynamicTextSlider width={textWidth} height={50}>
          <span className={className}>{children}</span>
        </DynamicTextSlider>
      </span>
    </>
  );
}
