"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

/**
 * Slider constants
 */
const MIN_RANGE = 50; // px – minimum gap between the two handles
const ROTATION_DEG = -2.76; // matches CSS transform
const THETA = ROTATION_DEG * (Math.PI / 180);
const COS_THETA = Math.cos(THETA);
const SIN_THETA = Math.sin(THETA);

/** Utility */
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

interface SliderProps {
  width: number;
  height?: number;
  handleSize?: number;
  onChange?: (values: { left: number; right: number; range: number }) => void;
  children: React.ReactNode;
}

/**
 * A two‑handle slider that is itself rotated.
 * The rotation angle now changes dynamically based on handle positions.
 * Dragging is projected on to this rotated axis so the handles feel natural.
 */
export function DynamicTextSlider({ 
  width: initialWidth, 
  height = 50, 
  handleSize = 24, 
  onChange,
  children 
}: SliderProps) {
  const width = initialWidth > 0 ? initialWidth + 35 : 0;
  
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(width);
  const [draggingHandle, setDraggingHandle] = useState<"left" | "right" | null>(null);
  const [dynamicRotation, setDynamicRotation] = useState(ROTATION_DEG);

  const leftRef = useRef(left);
  const rightRef = useRef(right);
  const dragRef = useRef<{
    handle: "left" | "right";
    startX: number;
    startY: number;
    initialLeft: number;
    initialRight: number;
  } | null>(null);

  useEffect(() => {
    leftRef.current = left;
    rightRef.current = right;
    onChange?.({ left, right, range: right - left });
  }, [left, right, onChange]);
  
  // Effect to calculate and set the dynamic rotation
  useEffect(() => {
    if (width > 0) {
      const handleMidpoint = (left + right) / 2;
      const sliderCenter = width / 2;
      const deviationFactor = (handleMidpoint - sliderCenter) / sliderCenter;
      const maxAdditionalTilt = 3; 
      const newRotation = ROTATION_DEG + (deviationFactor * maxAdditionalTilt);
      
      // Use requestAnimationFrame to avoid cascading renders
      requestAnimationFrame(() => {
        setDynamicRotation(newRotation);
      });
    }
  }, [left, right, width]);

  // Update right handle position when width changes
  useEffect(() => {
    if (width > 0 && right !== width) {
      requestAnimationFrame(() => {
        setRight(width);
      });
    }
  }, [width]); // eslint-disable-line react-hooks/exhaustive-deps

  const startDrag = (handle: "left" | "right", e: React.PointerEvent) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: leftRef.current,
      initialRight: rightRef.current,
    };
    setDraggingHandle(handle);
  };

  const moveDrag = useCallback(
    (e: PointerEvent) => {
      if (!dragRef.current) return;
      const { handle, startX, startY, initialLeft, initialRight } = dragRef.current;
      const dX = e.clientX - startX;
      const dY = e.clientY - startY;
      const projected = dX * COS_THETA + dY * SIN_THETA;
      if (handle === "left") {
        const newLeft = clamp(initialLeft + projected, 0, rightRef.current - MIN_RANGE);
        setLeft(newLeft);
      } else {
        const newRight = clamp(initialRight + projected, leftRef.current + MIN_RANGE, width);
        setRight(newRight);
      }
    },
    [width]
  );

  const endDrag = useCallback(() => {
    dragRef.current = null;
    setDraggingHandle(null);
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", moveDrag);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    return () => {
      window.removeEventListener("pointermove", moveDrag);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  }, [moveDrag, endDrag]);

  const nudgeHandle = (handle: "left" | "right") => (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const delta = e.key === "ArrowLeft" ? -10 : 10;
    if (handle === "left") {
      setLeft((prev) => clamp(prev + delta, 0, rightRef.current - MIN_RANGE));
    } else {
      setRight((prev) => clamp(prev + delta, leftRef.current + MIN_RANGE, width));
    }
  };

  return (
    <div
      className="relative select-none transition-transform duration-300 ease-out"
      style={{ width, height, transform: `rotate(${dynamicRotation}deg)` }}
    >
      <div className="absolute inset-0 rounded-2xl border border-[#008080] pointer-events-none" />
      {(["left", "right"] as const).map((handle) => {
        const x = handle === "left" ? left : right - handleSize;
        const scaleClass = draggingHandle === handle ? "scale-125" : "hover:scale-110";

        return (
          <button
            key={handle}
            type="button"
            aria-label={handle === "left" ? "Adjust start" : "Adjust end"}
            onPointerDown={(e) => startDrag(handle, e)}
            onKeyDown={nudgeHandle(handle)}
            className={`z-20 absolute top-0 h-full rounded-full bg-[#1a1a2e] border border-[#008080] flex items-center justify-center cursor-ew-resize focus:outline-none focus:ring-2 focus:ring-[#008080] transition-transform duration-150 ease-in-out opacity-100 ${scaleClass}`}
            style={{ left: x, width: handleSize, touchAction: "none" }}
          >
            <span className="w-1 h-6 rounded-full bg-[#008080]" />
          </button>
        );
      })}
      <div
        className="flex z-10 items-center justify-center w-full h-full px-4 overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${width - right}px 0 ${left}px round 1rem)` }}
      >
        {children}
      </div>
    </div>
  );
}
