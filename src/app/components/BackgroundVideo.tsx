"use client";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState, useRef } from "react";

interface HeroProps {
  onAnimationComplete?: () => void;
}

export default function Hero({ onAnimationComplete }: HeroProps) {
  const controls = useAnimation();
  const text = "Intelligent Inventory Optimization";
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const [phase, setPhase] = useState<"intro" | "exit" | "done">("intro");
  const [showUI, setShowUI] = useState(false);
  const [visibleVideoIndex, setVisibleVideoIndex] = useState(0);

  // Three 10-second videos
  const videos = [
    "/vidya1.mp4",
    "/vidya2.mp4",
    "/vidya3.mp4",
  ];

  // Randomized flicker order for text
  const randomOrder = useMemo(() => {
    const arr = Array.from({ length: text.length }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [text]);

  // Flicker-in text (slower, more pronounced)
  useEffect(() => {
    if (phase !== "intro") return;
    controls.start(i => ({
      opacity: [0, 0.6, 0.2, 1],
      x: [-20, 0],
      filter: ["blur(4px)", "blur(0px)"],
      transition: { delay: randomOrder[i] * 0.045, duration: 0.6, ease: "easeOut" }
    }));
    const delay = Math.max(...randomOrder) * 0.045 + 0.6;
    const timer = setTimeout(() => setShowUI(true), delay * 1000 + 50);
    return () => clearTimeout(timer);
  }, [controls, randomOrder, phase]);

  // Flicker-out text (slower, more lingering)
  useEffect(() => {
    if (phase !== "exit") return;
    controls.start(i => ({
      opacity: [1, 0.5, 0.8, 0],
      filter: ["blur(0px)", "blur(4px)"],
      transition: { delay: randomOrder[i] * 0.035, duration: 0.5, ease: "easeInOut" }
    }));
    const total = Math.max(...randomOrder) * 0.035 + 0.5;
    const timer = setTimeout(() => {
      setPhase("done");
      onAnimationComplete?.();
    }, total * 1000 + 50);
    return () => clearTimeout(timer);
  }, [controls, randomOrder, phase, onAnimationComplete]);

  // Video forward/backward loop with fade transitions and smooth reverse for all videos
  useEffect(() => {
    const vids = videoRefs.current.filter(vid => vid !== null) as HTMLVideoElement[];
    if (vids.length === 0) return;

    vids.forEach(vid => {
      vid.playbackRate = 0.75;
      vid.play().catch(err => console.error("Video playback failed:", err));
    });

    let dir = 1;
    const fade = 0.5; // seconds
    const fps = 60;
    const step = (1 / fps) * vids[0].playbackRate;
    let rafId: number;

    const loop = () => {
      let t = vids[0].currentTime + dir * step;

      if (t >= vids[0].duration || t <= 0) {
        const overshoot = t > vids[0].duration ? t - vids[0].duration : -t;
        vids.forEach(vid => {
          vid.style.transition = `opacity ${fade}s ease-in-out`;
          vid.style.opacity = "0";
        });
        setTimeout(() => {
          dir *= -1;
          vids.forEach(vid => {
            vid.currentTime = dir === -1
              ? vid.duration - overshoot
              : overshoot;
            vid.style.opacity = visibleVideoIndex === vids.indexOf(vid) ? "0.85" : "0";
          });
          rafId = requestAnimationFrame(loop);
        }, fade * 1000);
      } else {
        vids.forEach(vid => {
          vid.currentTime = t;
        });
        rafId = requestAnimationFrame(loop);
      }
    };

    rafId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafId);
      vids.forEach(vid => vid.pause());
    };
  }, [visibleVideoIndex]);

  // Switch between videos every 4 seconds
  useEffect(() => {
    const switchVideo = () => {
      const newIndex = (visibleVideoIndex + 1) % videos.length;
      setVisibleVideoIndex(newIndex);
    };

    // *** This is the line to adjust the transition interval ***
    const interval = 4000; // 4 seconds (change this value to adjust timing)

    const intervalId = setInterval(switchVideo, interval);
    return () => clearInterval(intervalId);
  }, [visibleVideoIndex, videos.length]);

  const handleClick = () => {
    setShowUI(false);
    setPhase("exit");
  };

  return (
    <div className="relative h-screen bg-black overflow-hidden">
      {/* Top black bar */}
      <motion.div
        className="absolute top-0 left-0 w-full h-[15%] bg-black z-10"
        animate={{ opacity: phase === "exit" ? 0 : 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
      {/* Bottom black bar */}
      <motion.div
        className="absolute bottom-0 left-0 w-full h-[15%] bg-black z-10"
        animate={{ opacity: phase === "exit" ? 0 : 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
      {/* Video container with 16:9 aspect ratio, 70% height */}
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <div className="relative w-full" style={{ paddingBottom: "39.375%" /* 70% * (9/16) */ }}>
          {videos.map((src, index) => (
            <motion.video
              key={index}
              ref={el => (videoRefs.current[index] = el)}
              className="absolute top-0 left-0 w-full h-full object-cover"
              src={src}
              muted
              autoPlay
              playsInline
              loop={false}
              initial={{ opacity: 0 }}
              animate={{ opacity: visibleVideoIndex === index ? 0.85 : 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }} // Badass crossfade
            />
          ))}
        </div>
      </div>

      {/* Flicker heading */}
      <div className="absolute inset-0 flex items-center justify-center px-4 z-20">
        <motion.h1 className="text-white text-4xl font-bold">
          {text.split("").map((char, i) => (
            <motion.span
              key={i}
              custom={i}
              initial={{ opacity: 0, x: -10 }}
              animate={controls}
              className="inline-block"
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.h1>
      </div>

      {/* Tagline & button below heading */}
      <AnimatePresence>
        {showUI && phase === "intro" && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center pt-40 px-4 z-30 space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <p className="text-white italic text-lg text-center">
              Smarter control. Better forecasting. Less chaos.
            </p>
            <button
              onClick={handleClick}
              className="px-6 py-2 bg-white rounded-md text-gray-900 font-medium hover:bg-zinc-100 transition-colors duration-300"
            >
              Get Started
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}