"use client";
import { cn } from "@/lib/utils";
import React, { createContext, useState, useContext, useRef, useEffect } from "react";
const MouseEnterContext = createContext(undefined);
export const CardContainer = ({ children, className, containerClassName }) => {
  const containerRef = useRef(null);
  const [isMouseEntered, setIsMouseEntered] = useState(false);
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25;
    const y = (e.clientY - top - height / 2) / 25;
    containerRef.current.style.transform = `rotateY(${x}deg) rotateX(${y * -1}deg)`;
  };
  const handleMouseEnter = () => { setIsMouseEntered(true); };
  const handleMouseLeave = () => {
    if (!containerRef.current) return;
    setIsMouseEntered(false);
    containerRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
  };
  return (
    <MouseEnterContext.Provider value={[isMouseEntered, setIsMouseEntered]}>
      <div className={cn("flex items-center justify-center", containerClassName)} style={{ perspective: "1000px" }}>
        <div ref={containerRef} onMouseEnter={handleMouseEnter} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className={cn("flex items-center justify-center relative transition-all duration-200 ease-linear", className)} style={{ transformStyle: "preserve-3d" }}>
          {children}
        </div>
      </div>
    </MouseEnterContext.Provider>
  );
};
export const CardBody = ({ children, className }) => {
  return <div className={cn("h-96 w-96 [transform-style:preserve-3d] [&>*]:[transform-style:preserve-3d]", className)}>{children}</div>;
};
export const useMouseEnter = () => {
  const context = useContext(MouseEnterContext);
  if (context === undefined) throw new Error("useMouseEnter must be used within a MouseEnterProvider");
  return context;
};