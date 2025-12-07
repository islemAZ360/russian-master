"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+-=";

export const TextGenerateEffect = ({ words, className }) => {
  const [text, setText] = useState(words);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let iterations = 0;
    setIsAnimating(true);

    const interval = setInterval(() => {
      setText(words
        .split("")
        .map((letter, index) => {
          if (index < iterations) {
            return words[index];
          }
          return LETTERS[Math.floor(Math.random() * 26)];
        })
        .join(""));

      if (iterations >= words.length) {
        clearInterval(interval);
        setIsAnimating(false);
      }

      iterations += 1 / 3;
    }, 30);

    return () => clearInterval(interval);
  }, [words]);

  return (
    <motion.div className={className}>
      <div className="mt-4">
        <div className="dark:text-white text-white leading-snug tracking-wide font-mono">
          {text}
          {isAnimating && <span className="animate-pulse text-cyan-500">_</span>}
        </div>
      </div>
    </motion.div>
  );
};