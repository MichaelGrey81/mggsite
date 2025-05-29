

// "use client";
// import { motion, useAnimation, AnimatePresence } from "framer-motion";
// import { useEffect, useMemo, useState, useRef } from "react";

// interface HeroProps {
//   onAnimationComplete?: () => void;
// }

// export default function Hero({ onAnimationComplete }: HeroProps) {
//   const controls = useAnimation();
//   const text = "Intelligent  Inventory  Optimization";
//   const videoSources = ["/vidya1.mp4", "/vidya2.mp4", "/vidya3.mp4"];
//   const playbackRate = 0.7; // native playback speed for smoother, slower loop

//   // Random order for flicker
//   const randomOrder = useMemo(() => {
//     const arr = Array.from({ length: text.length }, (_, i) => i);
//     for (let i = arr.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [arr[i], arr[j]] = [arr[j], arr[i]];
//     }
//     return arr;
//   }, [text]);

//   const [phase, setPhase] = useState<'intro' | 'exit' | 'done'>('intro');
//   const [vidIndex, setVidIndex] = useState(0);
//   const [videoStarted, setVideoStarted] = useState(false);
//   const [showTagline, setShowTagline] = useState(false);
//   const [showButton, setShowButton] = useState(false);

//   const videoRefs = useRef<HTMLVideoElement[]>([]);

//   // Buffer and immediate play of all videos, enable native loop and set playbackRate
//   useEffect(() => {
//     videoRefs.current.forEach(v => {
//       if (v) {
//         v.preload = 'auto';
//         v.muted = true;
//         v.loop = true;
//         v.playbackRate = playbackRate;  // <-- line setting native playback speed
//         v.play().catch(() => {});
//       }
//     });
//     setVideoStarted(true);
//   }, [playbackRate]);

//   // Cross-fade videos with layered z-index, staggered by interval
//   useEffect(() => {
//     const iv = setInterval(() => setVidIndex(i => (i + 1) % videoSources.length), 4000);
//     return () => clearInterval(iv);
//   }, []);

//   // Title flicker then tagline/button
// useEffect(() => {
//   if (phase !== 'intro' || !videoStarted) return;
//   controls.start(i => ({
//     opacity: [0, 1, 0, 1, 0, 1],
//     filter: [
//       'blur(0px)',
//       'blur(10px)',
//       'blur(0px)',
//       'blur(10px)',
//       'blur(5px)',
//       'blur(0px)'
//     ],
//     transition: {
//       delay: randomOrder[i] * 0.04,      // 70% of 0.08
//       times: [0, 0.2, 0.4, 0.6, 0.8, 1],
//       duration: 0.5,                      // 70% of 1.0
//       ease: 'easeOut'
//     }
//   })).then(() => {
//     setTimeout(() => setShowTagline(true), 210);   // 70% of 300ms
//     setTimeout(() => setShowButton(true), 420);    // 70% of 600ms
//   });
// }, [controls, phase, videoStarted, randomOrder]);
//   // Exit animation
//   useEffect(() => {
//   if (phase !== 'exit') return;
//   setShowTagline(false);
//   setShowButton(false);
//   controls.start(i => ({
//     opacity: [1, 0, 1, 0, 1, 0],
//     filter: [
//       'blur(0px)',
//       'blur(10px)',
//       'blur(0px)',
//       'blur(10px)',
//       'blur(5px)',
//       'blur(0px)'
//     ],
//     transition: {
//       delay: randomOrder[i] * 0.08,       // slower stagger
//       times: [0, 0.2, 0.4, 0.6, 0.8, 1],  // more even timing
//       duration: 1.0,                      // longer overall
//       ease: 'easeInOut'
//     }
//   })).then(() => {
//     setPhase('done');
//     onAnimationComplete?.();
//   });
// }, [controls, phase, randomOrder, onAnimationComplete]);

//   return (
//     <div className="relative h-screen bg-black overflow-hidden text-center">
//       {/* Videos */}
//       <div className="absolute inset-0 flex items-center justify-center">
//         <div className="w-full h-[70%] aspect-[16/9] relative">
//           {videoSources.map((src, i) => (
//             <motion.video
//               key={i}
//               ref={el => (videoRefs.current[i] = el!)}
//               src={src}
//               muted
//               playsInline
//               preload="auto"
//               loop
//               className="absolute inset-0 w-full h-full object-cover"
//               style={{ zIndex: vidIndex === i ? 1 : 0 }}
//               initial={{ opacity: 0 }}  // fade in on load
//               animate={{ opacity: vidIndex === i ? 0.6 : 0.2 }}
//               transition={{  duration: 2, ease: 'easeInOut' }} 
//             />
//           ))}
//         </div>
//       </div>

//       {/* Title */}
//       <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 pb-8">
//         <motion.h1 className="text-white text-4xl font-bold">
//           {text.split('').map((char, i) => (
//             <motion.span
//               key={i}
//               custom={i}
//               initial={{ opacity: 0, x: -10 }}
//               animate={controls}
//               className="inline-block"
//             >
//               {char === ' ' ? '\u00A0' : char}
//             </motion.span>
//           ))}
//         </motion.h1>
//       </div>

//       {/* Tagline & Button (stay above videos) */}
//       <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
//         <AnimatePresence>
//           {showTagline && (
//             <motion.p
//               className="text-white italic text-lg absolute mt-24 pb-8"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 3, ease: 'easeOut' }}
//             >
//               Smarter control. Better forecasting. Less chaos.
//             </motion.p>
//           )}
//         </AnimatePresence>
//         <AnimatePresence>
//           {showButton && (
//             <motion.button
//               onClick={() => setPhase('exit')}
//               className="px-6 py-2 bg-white rounded-md text-gray-900 absolute mt-40 z-30"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0 }}
//               transition={{ delay: 1.5, duration: 2, ease: 'easeOut' }}
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
import { useEffect, useMemo, useState } from "react";

interface HeroProps {
  onAnimationComplete?: () => void;
}

export default function Hero({ onAnimationComplete }: HeroProps) {
  const controls = useAnimation();
  const text = "Intelligent  Inventory  Optimization";

  const randomOrder = useMemo(() => {
    const arr = Array.from({ length: text.length }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [text]);

  const [phase, setPhase] = useState<'intro' | 'exit' | 'done'>('intro');
  const [showTagline, setShowTagline] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [particles, setParticles] = useState<
    { x: number; y: number; size: number; delay: number; tracer?: boolean; angle?: number }[]
  >([]);

  useEffect(() => {
    const played = sessionStorage.getItem("introPlayed");
    if (played === "true") {
      setPhase("done");
      onAnimationComplete?.();
    }
  }, [onAnimationComplete]);

  useEffect(() => {
    const generateParticles = () => {
      const particleArray = Array.from({ length: 60 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1.5,
        delay: Math.random() * 2.5,
        tracer: i < 6,
        angle: Math.random() * 360, // For tracer direction
      }));
      setParticles(particleArray);
    };
    generateParticles();
    const interval = setInterval(generateParticles, 7000); // Slightly faster refresh for flow
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (phase !== 'intro') return;
    controls.start(i => ({
      opacity: [0, 1, 0.5, 1, 0.6, 0.9],
      filter: [
        'blur(0px)',
        'blur(12px)',
        'blur(0px)',
        'blur(8px)',
        'blur(4px)',
        'blur(0px)'
      ],
      transition: {
        delay: randomOrder[i] * 0.04,
        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
        duration: 0.6,
        ease: 'easeOut'
      }
    })).then(() => {
      setTimeout(() => setShowTagline(true), 250);
      setTimeout(() => setShowButton(true), 500);
    });
  }, [controls, phase, randomOrder]);

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
        delay: randomOrder[i] * 0.08,
        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
        duration: 1.0,
        ease: 'easeInOut'
      }
    })).then(() => {
      setPhase('done');
      sessionStorage.setItem("introPlayed", "true");
      onAnimationComplete?.();
    });
  }, [controls, phase, randomOrder, onAnimationComplete]);

  return (
    <div className="relative h-screen bg-black overflow-hidden text-center">
      {/* Neural Network Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Subtle Background Glow */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at center, rgba(59,130,246,0.1) 0%, rgba(0,0,0,0.9) 70%)",
          }}
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        />
        {particles.map((p, i) => (
          <motion.div
            key={`p-${i}`}
            className="absolute rounded-full"
            style={{
              background: p.tracer
                ? "linear-gradient(90deg, rgba(59,130,246,0.9), rgba(168,85,247,0.2))"
                : "radial-gradient(circle, rgba(59,130,246,0.5) 0%, rgba(168,85,247,0.05) 100%)",
              boxShadow: p.tracer
                ? "0 0 15px rgba(59,130,246,0.9)"
                : "0 0 8px rgba(59,130,246,0.3)",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.tracer ? 10 : p.size,
              height: p.tracer ? 2 : p.size,
              transform: p.tracer ? `rotate(${p.angle}deg)` : undefined,
            }}
            initial={{ opacity: 0 }}
            animate={{
              scale: p.tracer ? [1, 1.6, 1] : [0.7, 1.3, 0.7],
              opacity: p.tracer ? [0, 1, 0] : [0, 0.6, 0],
              x: p.tracer ? Math.cos((p.angle * Math.PI) / 180) * 15 : 0,
              y: p.tracer ? Math.sin((p.angle * Math.PI) / 180) * 15 : 0,
            }}
            transition={{
              repeat: Infinity,
              duration: p.tracer ? 1.8 : 4.5,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}
        <svg className="absolute inset-0 w-full h-full">
          {particles.map((p1, i) =>
            particles.slice(i + 1).map((p2, j) => {
              const dx = p1.x - p2.x;
              const dy = p1.y - p2.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 20) {
                return (
                  <motion.line
                    key={`l-${i}-${j}`}
                    x1={`${p1.x}%`}
                    y1={`${p1.y}%`}
                    x2={`${p2.x}%`}
                    y2={`${p2.y}%`}
                    stroke="url(#glowLine)"
                    strokeWidth="0.7"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 5,
                      delay: p1.delay * 0.9,
                      ease: "easeInOut",
                    }}
                  />
                );
              }
              return null;
            })
          )}
          <defs>
            <linearGradient id="glowLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(59,130,246,0.7)" />
              <stop offset="50%" stopColor="rgba(168,85,247,0.5)" />
              <stop offset="100%" stopColor="rgba(59,130,246,0.7)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 pb-8">
        <motion.h1 className="text-white text-4xl font-bold opacity-90">
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

      {/* Tagline & Button */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <AnimatePresence>
          {showTagline && (
            <motion.p
              className="text-blue-300 italic text-lg absolute mt-24 pb-8 opacity-70"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: 'easeOut' }}
            >
              Smarter control. Better forecasting. Less chaos.
            </motion.p>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showButton && (
            <motion.button
              onClick={() => setPhase('exit')}
              className="px-6 py-2 rounded-md text-white font-medium mt-40 z-30 border border-gray-400 bg-[linear-gradient(145deg,rgba(200,200,200,0.15),rgba(80,80,80,0.15))] hover:bg-[linear-gradient(145deg,rgba(230,230,230,0.3),rgba(100,100,100,0.2))] backdrop-blur-sm shadow-[0_0_10px_rgba(255,255,255,0.15)] transition-all"
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