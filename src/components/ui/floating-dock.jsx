"use client";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";

export const FloatingDock = ({ items, className }) => {
  return (
    <div className={cn("relative", className)}>
      <FloatingDockBar items={items} />
    </div>
  );
};

const FloatingDockBar = ({ items }) => {
  let mouseX = useMotionValue(Infinity);
  
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      // التغيير هنا: استخدام smart-dock بدلاً من كلاسات الألوان الثابتة
      className={cn(
        "smart-dock mx-auto flex h-16 gap-3 items-end rounded-2xl px-3 pb-3",
        "shadow-2xl shadow-black/40 max-w-[95vw] overflow-x-visible"
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({ mouseX, title, icon, onClick }) {
  let ref = useRef(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // تقليل حدة الحركة قليلاً لتوفير الأداء
  let widthTransform = useTransform(distance, [-150, 0, 150], [40, 60, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [40, 60, 40]);

  let width = useSpring(widthTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  let height = useSpring(heightTransform, { mass: 0.1, stiffness: 150, damping: 12 });

  const [hovered, setHovered] = useState(false);

  return (
    <div onClick={onClick}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        // إضافة will-change لتحسين الأداء
        className="aspect-square rounded-full bg-white/5 flex items-center justify-center relative cursor-pointer border border-white/10 hover:bg-white/10 transition-colors will-change-transform"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="hidden md:block px-2 py-0.5 whitespace-pre rounded-md bg-black/90 border border-white/20 text-white absolute left-1/2 -translate-x-1/2 -top-10 w-fit text-xs font-bold z-50 pointer-events-none"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div className="flex items-center justify-center text-neutral-300 w-5 h-5 md:w-6 md:h-6">
            {icon}
        </motion.div>
      </motion.div>
    </div>
  );
}