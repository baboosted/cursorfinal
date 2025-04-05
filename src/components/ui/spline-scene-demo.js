"use client";

import React, { useEffect, useState } from "react";
import { SplineScene } from "./spline-scene";
import { Card } from "./card";
import { Spotlight } from "./spotlight";

export function SplineSceneBasic() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  return (
    <Card
      className={`w-full ${
        isMobile ? "h-[300px]" : "h-[500px]"
      } bg-black/[0.96] border-0 relative overflow-hidden`}
    >
      <Spotlight
        className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        fill="white"
      />

      {/* Centered robot with transparent background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <SplineScene
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          className="w-full h-full"
        />
      </div>

      {/* Mobile-only click around message */}
      {isMobile && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 animate-bounce-slow pointer-events-none">
          <p className="text-white/90 text-sm font-medium">Click around!</p>
        </div>
      )}
    </Card>
  );
}
