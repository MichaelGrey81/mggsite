
// "use client";
// import { motion, useAnimation, AnimatePresence } from "framer-motion";
// import { useEffect, useMemo, useRef, useState } from "react";

// interface HeroProps {
//   onAnimationComplete?: () => void;
// }

// export default function Hero({ onAnimationComplete }: HeroProps) {
//   const text = "Intelligent Inventory Optimization";
//   const videoSources = ["/vidya1.mp4", "/vidya2.mp4", "/vidya3.mp4"];
//   const videoRefs = useRef<HTMLVideoElement[]>([]);

//   const controls = useAnimation();
//   const randomOrder = useMemo(() => {
//     const arr = [...Array(text.length).keys()];
//     for (let i = arr.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [arr[i], arr[j]] = [arr[j], arr[i]];
//     }
//     return arr;
//   }, [text]);

//   const [phase, setPhase] = useState<"intro" | "exit" | "done">("intro");
//   const [showTagline, setShowTagline] = useState(false);
//   const [showButton, setShowButton] = useState(false);
//   const [vidIndex, setVidIndex] = useState(0);

//   useEffect(() => {
//     videoRefs.current.forEach((v) => {
//       if (v) {
//         v.preload = "auto";
//         v.muted = true;
//         v.play().catch(() => {});
//       }
//     });
//     const interval = setInterval(() => setVidIndex((i) => (i + 1) % videoSources.length), 4000);
//     return () => clearInterval(interval);
//   }, [videoSources.length]);

//   useEffect(() => {
//     const vid = videoRefs.current[vidIndex];
//     if (!vid) return;
//     let dir = 1;
//     let rafId: number;
//     const speedFactor = 0.1;

//     const step = () => {
//       if (!vid.duration || !isFinite(vid.duration)) {
//         rafId = requestAnimationFrame(step);
//         return;
//       }
//       const delta = dir * (speedFactor / 60);
//       let next = vid.currentTime + delta;
//       if (next >= vid.duration) {
//         next = vid.duration;
//         dir = -1;
//       } else if (next <= 0) {
//         next = 0;
//         dir = 1;
//       }
//       vid.currentTime = next;
//       rafId = requestAnimationFrame(step);
//     };

//     vid.play().catch(() => {});
//     rafId = requestAnimationFrame(step);

//     return () => {
//       cancelAnimationFrame(rafId);
//     };
//   }, [vidIndex]);

//   useEffect(() => {
//     if (phase !== "intro") return;
//     controls
//       .start((i) => ({
//         opacity: [0, 0.8, 0.2, 1],
//         x: [-20, 0],
//         filter: ["blur(4px)", "blur(0px)"],
//         transition: { delay: randomOrder[i] * 0.045, duration: 0.4, ease: "easeOut" },
//       }))
//       .then(() => {
//         controls.start({ opacity: 1, transition: { duration: 0.5 } });
//         setTimeout(() => setShowTagline(true), 500);
//         setTimeout(() => setShowButton(true), 1000);
//       });
//   }, [controls, phase, randomOrder]);

//   useEffect(() => {
//     if (phase !== "exit") return;
//     controls.start((i) => ({
//       opacity: [1, 0.2, 0],
//       filter: ["blur(0px)", "blur(4px)"],
//       transition: { delay: randomOrder[i] * 0.035, duration: 0.3, ease: "easeInOut" },
//     }));
//     const total = Math.max(...randomOrder) * 0.035 + 0.3;
//     setTimeout(() => {
//       setPhase("done");
//       onAnimationComplete?.();
//     }, total * 1000 + 50);
//   }, [controls, phase, randomOrder, onAnimationComplete]);

//   return (
//     <div className="relative h-screen bg-black overflow-hidden text-center">
//       <div className="absolute inset-0 flex items-center justify-center">
//         <div className="w-full h-[70%] aspect-[16/9] relative">
//           {videoSources.map((src, i) => (
//             <motion.video
//               key={i}
//               ref={(el) => (videoRefs.current[i] = el!)}
//               src={src}
//               muted
//               playsInline
//               preload="auto"
//               className="absolute inset-0 w-full h-full object-cover"
//               initial={{ opacity: 0.05 }}
//               animate={{ opacity: vidIndex === i ? 0.6 : 0.05 }}
//               transition={{ duration: 1.5, ease: "easeInOut" }}
//             />
//           ))}
//         </div>
//       </div>

//       <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 space-y-6">
//         <motion.h1 className="text-white text-4xl font-bold">
//           {text.split("").map((char, i) => (
//             <motion.span
//               key={i}
//               custom={i}
//               initial={{ opacity: 0, x: -10 }}
//               animate={controls}
//               className="inline-block"
//             >
//               {char === " " ? "\u00A0" : char}
//             </motion.span>
//           ))}
//         </motion.h1>

//         <AnimatePresence>
//           {showTagline && (
//             <motion.p
//               className="text-white italic text-lg"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 1, ease: "easeIn" }}
//             >
//               Smarter control. Better forecasting. Less chaos.
//             </motion.p>
//           )}
//         </AnimatePresence>

//         <AnimatePresence>
//           {showButton && (
//             <motion.button
//               onClick={() => setPhase("exit")}
//               className="px-6 py-2 bg-white rounded-md text-gray-900"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 1, ease: "easeIn" }}
//             >
//               Get Started
//             </motion.button>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }

"use client";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState, useRef } from "react";

interface HeroProps {
  onAnimationComplete?: () => void;
}

export default function Hero({ onAnimationComplete }: HeroProps) {
  const controls = useAnimation();
  const text = "Intelligent  Inventory  Optimization";
  const videoSources = ["/vidya1.mp4", "/vidya2.mp4", "/vidya3.mp4"];
  const playbackRate = 0.7; // native playback speed for smoother, slower loop

  // Random order for flicker
  const randomOrder = useMemo(() => {
    const arr = Array.from({ length: text.length }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [text]);

  const [phase, setPhase] = useState<'intro' | 'exit' | 'done'>('intro');
  const [vidIndex, setVidIndex] = useState(0);
  const [videoStarted, setVideoStarted] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const videoRefs = useRef<HTMLVideoElement[]>([]);

  // Buffer and immediate play of all videos, enable native loop and set playbackRate
  useEffect(() => {
    videoRefs.current.forEach(v => {
      if (v) {
        v.preload = 'auto';
        v.muted = true;
        v.loop = true;
        v.playbackRate = playbackRate;  // <-- line setting native playback speed
        v.play().catch(() => {});
      }
    });
    setVideoStarted(true);
  }, [playbackRate]);

  // Cross-fade videos with layered z-index, staggered by interval
  useEffect(() => {
    const iv = setInterval(() => setVidIndex(i => (i + 1) % videoSources.length), 4000);
    return () => clearInterval(iv);
  }, []);

  // Title flicker then tagline/button
useEffect(() => {
  if (phase !== 'intro' || !videoStarted) return;
  controls.start(i => ({
    opacity: [0, 1, 0, 1, 0, 1],
    filter: [
      'blur(0px)',
      'blur(10px)',
      'blur(0px)',
      'blur(10px)',
      'blur(5px)',
      'blur(0px)'
    ],
    transition: {
      delay: randomOrder[i] * 0.04,      // 70% of 0.08
      times: [0, 0.2, 0.4, 0.6, 0.8, 1],
      duration: 0.5,                      // 70% of 1.0
      ease: 'easeOut'
    }
  })).then(() => {
    setTimeout(() => setShowTagline(true), 210);   // 70% of 300ms
    setTimeout(() => setShowButton(true), 420);    // 70% of 600ms
  });
}, [controls, phase, videoStarted, randomOrder]);
  // Exit animation
  useEffect(() => {
  if (phase !== 'exit') return;
  setShowTagline(false);
  setShowButton(false);
  controls.start(i => ({
    opacity: [1, 0, 1, 0, 1, 0],
    filter: [
      'blur(0px)',
      'blur(10px)',
      'blur(0px)',
      'blur(10px)',
      'blur(5px)',
      'blur(0px)'
    ],
    transition: {
      delay: randomOrder[i] * 0.08,       // slower stagger
      times: [0, 0.2, 0.4, 0.6, 0.8, 1],  // more even timing
      duration: 1.0,                      // longer overall
      ease: 'easeInOut'
    }
  })).then(() => {
    setPhase('done');
    onAnimationComplete?.();
  });
}, [controls, phase, randomOrder, onAnimationComplete]);

  return (
    <div className="relative h-screen bg-black overflow-hidden text-center">
      {/* Videos */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-[70%] aspect-[16/9] relative">
          {videoSources.map((src, i) => (
            <motion.video
              key={i}
              ref={el => (videoRefs.current[i] = el!)}
              src={src}
              muted
              playsInline
              preload="auto"
              loop
              className="absolute inset-0 w-full h-full object-cover"
              style={{ zIndex: vidIndex === i ? 1 : 0 }}
              initial={{ opacity: 0 }}  // fade in on load
              animate={{ opacity: vidIndex === i ? 0.6 : 0.2 }}
              transition={{  duration: 2, ease: 'easeInOut' }} 
            />
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 pb-8">
        <motion.h1 className="text-white text-4xl font-bold">
          {text.split('').map((char, i) => (
            <motion.span
              key={i}
              custom={i}
              initial={{ opacity: 0, x: -10 }}
              animate={controls}
              className="inline-block"
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.h1>
      </div>

      {/* Tagline & Button (stay above videos) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <AnimatePresence>
          {showTagline && (
            <motion.p
              className="text-white italic text-lg absolute mt-24 pb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3, ease: 'easeOut' }}
            >
              Smarter control. Better forecasting. Less chaos.
            </motion.p>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showButton && (
            <motion.button
              onClick={() => setPhase('exit')}
              className="px-6 py-2 bg-white rounded-md text-gray-900 absolute mt-40 z-30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1.5, duration: 2, ease: 'easeOut' }}
            >
              Get Started
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}