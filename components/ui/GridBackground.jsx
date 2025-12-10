// FILE: components/ui/GridBackground.jsx
"use client";
import React from "react";

export function GridBackground() {
  return (
    <div className="fixed inset-0 z-[-1] h-full w-full bg-[#050505] overflow-hidden pointer-events-none">
      {/* الشبكة الأساسية */}
      <div className="absolute h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      {/* تأثير الضوء المحيطي */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
    </div>
  );
}