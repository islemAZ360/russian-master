"use client";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

const CHARS = "-_~=@#$%^&*()_+{}|:<>?";

export const DecryptText = ({ text, className }) => {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);

  const animate = () => {
    let iteration = 0;
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText((prev) =>
        prev
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return text[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(intervalRef.current);
      }

      iteration += 1 / 3;
    }, 30);
  };

  useEffect(() => {
    animate(); // تشغيل عند التحميل
  }, []);

  return (
    <motion.span
      className={`inline-block font-mono cursor-default ${className}`}
      onMouseEnter={() => animate()} // تشغيل عند التحويم
    >
      {displayText}
    </motion.span>
  );
};