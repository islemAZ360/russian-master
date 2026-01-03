"use client";
import React from "react";
import DarkVeil from "./DarkVeil";

export const CosmicBackground = React.memo(() => {
  return (
    <div className="fixed inset-0 w-full h-full z-[-1] overflow-hidden">
        <DarkVeil />
    </div>
  );
});

CosmicBackground.displayName = "CosmicBackground";