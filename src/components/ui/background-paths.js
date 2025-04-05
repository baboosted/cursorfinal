import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "./button";

export function FloatingPaths({ position, isMobile }) {
  // Further reduce path count for mobile
  const pathCount = isMobile ? 6 : 48;

  const paths = Array.from({ length: pathCount }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 1.5 + i * 0.07,
  }));

  // For mobile, use static SVG paths instead of animated ones
  if (isMobile) {
    return (
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <svg
          className="w-full h-full"
          viewBox="0 0 696 316"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <title>Background Paths</title>
          {paths.map((path) => (
            <path
              key={path.id}
              d={path.d}
              stroke="rgba(0, 0, 0, 0.75)"
              strokeWidth={path.width}
              strokeOpacity={0.15 + path.id * 0.02}
            />
          ))}
        </svg>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="w-full h-full"
        viewBox="0 0 696 316"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="rgba(0, 0, 0, 0.75)"
            strokeWidth={path.width}
            strokeOpacity={0.15 + path.id * 0.02}
            initial={{ pathLength: 0.3, opacity: 0.7 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 12 + Math.random() * 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export function BackgroundPaths({
  title = "Background Paths",
  hideContent = false,
  className = "",
}) {
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // For very small screens, don't render the background at all
  if (isMobile && window.innerWidth < 480) {
    return (
      <div
        className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}
      >
        {!hideContent && (
          <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
            <RenderContent title={title} />
          </div>
        )}
      </div>
    );
  }

  const words = title.split(" ");

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 opacity-60">
        {/* Only render one instance on mobile to reduce load */}
        <FloatingPaths position={1} isMobile={isMobile} />
        {!isMobile && <FloatingPaths position={-1} isMobile={false} />}
      </div>

      {!hideContent && (
        <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
          <RenderContent title={title} />
        </div>
      )}
    </div>
  );
}

// Extract the content rendering to a separate component
function RenderContent({ title }) {
  const words = title.split(" ");
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // For mobile, use simpler animations with fewer effects
  if (isMobile) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 to-neutral-700/80 dark:from-white dark:to-white/80">
          {title}
        </h1>

        <div className="inline-block group relative bg-gradient-to-b from-black/10 to-white/10 dark:from-white/10 dark:to-black/10 p-px rounded-2xl backdrop-blur-lg overflow-hidden shadow-lg">
          <Button
            variant="ghost"
            className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md bg-white/95 dark:bg-black/95 text-black dark:text-white border border-black/10 dark:border-white/10"
          >
            <span className="opacity-90">Discover Excellence</span>
            <span className="ml-3 opacity-70">→</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="max-w-4xl mx-auto"
    >
      <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter">
        {words.map((word, wordIndex) => (
          <span key={wordIndex} className="inline-block mr-4 last:mr-0">
            {word.split("").map((letter, letterIndex) => (
              <motion.span
                key={`${wordIndex}-${letterIndex}`}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: wordIndex * 0.1 + letterIndex * 0.03,
                  type: "spring",
                  stiffness: 150,
                  damping: 25,
                }}
                className="inline-block text-transparent bg-clip-text 
                                bg-gradient-to-r from-neutral-900 to-neutral-700/80 
                                dark:from-white dark:to-white/80"
              >
                {letter}
              </motion.span>
            ))}
          </span>
        ))}
      </h1>

      <div
        className="inline-block group relative bg-gradient-to-b from-black/10 to-white/10 
                dark:from-white/10 dark:to-black/10 p-px rounded-2xl backdrop-blur-lg 
                overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
      >
        <Button
          variant="ghost"
          className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md 
                    bg-white/95 hover:bg-white/100 dark:bg-black/95 dark:hover:bg-black/100 
                    text-black dark:text-white transition-all duration-300 
                    group-hover:-translate-y-0.5 border border-black/10 dark:border-white/10
                    hover:shadow-md dark:hover:shadow-neutral-800/50"
        >
          <span className="opacity-90 group-hover:opacity-100 transition-opacity">
            Discover Excellence
          </span>
          <span
            className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 
                        transition-all duration-300"
          >
            →
          </span>
        </Button>
      </div>
    </motion.div>
  );
}
