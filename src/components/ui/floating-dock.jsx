"use client";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { useSettings } from "@/context/SettingsContext"; // استيراد الإعدادات

export const FloatingDock = ({ items, className }) => {
  return (
    <div className={cn("relative", className)}>
      <FloatingDockBar items={items} />
    </div>
  );
};

const FloatingDockBar = ({ items }) => {
  let mouseX = useMotionValue(Infinity);
  const { isDark } = useSettings(); // الحصول على حالة الثيم
  
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "smart-dock mx-auto flex h-16 md:h-20 gap-2 md:gap-4 items-end rounded-2xl px-2 md:px-4 pb-2 md:pb-3",
        "shadow-2xl shadow-black/40 max-w-[95vw] overflow-x-auto no-scrollbar touch-pan-x" 
      )}
    >
      {items.map((item) => (
        <IconContainer 
            mouseX={mouseX} 
            key={item.title} 
            {...item} 
            isDark={isDark} // تمرير الحالة
        />
      ))}
    </motion.div>
  );
};

function IconContainer({ mouseX, title, icon, onClick, isDark }) {
  let ref = useRef(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  let widthTransform = useTransform(distance, [-150, 0, 150], [40, 65, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [40, 65, 40]);

  let width = useSpring(widthTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  let height = useSpring(heightTransform, { mass: 0.1, stiffness: 150, damping: 12 });

  const [hovered, setHovered] = useState(false);

  // تحديد لون الأيقونة
  // إذا كانت الأيقونة "Base" (Home) والوضع نهاري (!isDark)، نستخدم لوناً داكناً
  // باقي الأيقونات تبقى كما هي (تحتوي على ألوانها الخاصة في المصفوفة الأصلية) أو تأخذ الرمادي الفاتح
  const iconClass = (title === "Base" && !isDark) 
    ? "text-neutral-700" 
    : "text-neutral-300";

  return (
    <div onClick={onClick} className="shrink-0">
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
            "aspect-square rounded-full flex items-center justify-center relative cursor-pointer border transition-colors will-change-transform",
            // تغيير خلفية الدائرة في الوضع النهاري لتكون واضحة
            isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-gray-100 border-gray-200 hover:bg-gray-200"
        )}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: -10, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className={cn(
                  "hidden md:block px-2 py-0.5 whitespace-pre rounded-md border absolute left-1/2 -translate-x-1/2 -top-8 w-fit text-xs font-bold z-50 pointer-events-none",
                  isDark ? "bg-black/90 border-white/20 text-white" : "bg-white border-gray-200 text-black shadow-md"
              )}
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* نطبق كلاس اللون فقط إذا لم يكن العنصر يحتوي على لون خاص به مسبقاً (مثل الـ svg الممرر) */}
        {/* في الكود الأصلي في page.js، أيقونة Home لديها كلاس text-white/80. */}
        {/* هنا نقوم بتغليف الأيقونة في div ونطبق اللون عليه لفرض التغيير */}
        <div className={cn("flex items-center justify-center w-5 h-5 md:w-6 md:h-6", iconClass)}>
            {/* نقوم باستنساخ الأيقونة لتمرير الكلاس الجديد إذا لزم الأمر، أو نعتمد على الـ div المحيط */}
            {React.isValidElement(icon) 
                ? React.cloneElement(icon, { 
                    className: cn(icon.props.className, title === "Base" && !isDark ? "text-neutral-700" : "") 
                  }) 
                : icon
            }
        </div>
      </motion.div>
    </div>
  );
}