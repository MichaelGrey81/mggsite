"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import Link from "next/link";

export default function MusicPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gifRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentGifIndex, setCurrentGifIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Music GIFs - using your actual GIF files
  const musicGifs = [
    "/gifs/20250603_2306_Electrifying Club Vibes_simple_compose_01jwwhwykqe4zrs9bnkt15j6xg (1).gif",
    "/gifs/20250603_2310_DJ Night Extravaganza_simple_compose_01jwwj4xvtfv6sr7dqpbejq7ns.gif",
    "/gifs/20250603_2328_Blend Video_blend_01jwwk5yawed2s7afhd6x4ntwe.gif",
    "/gifs/20250603_2331_Blend Video_blend_01jwwkb3znfht89fapwd6t983n.gif"
  ];

  useEffect(() => {
    setIsLoaded(true);
    
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" }
      );
    }

    // Initialize all GIFs to be invisible except the first one
    gifRefs.current.forEach((ref, index) => {
      if (ref) {
        gsap.set(ref, { opacity: index === 0 ? 1 : 0 });
      }
    });
  }, []);

  // Fluid GIF transition effect with GSAP - smoother fade every 3.5 seconds
  useEffect(() => {
    if (isLoaded && musicGifs.length > 1) {
      const interval = setInterval(() => {
        const currentRef = gifRefs.current[currentGifIndex];
        const nextIndex = (currentGifIndex + 1) % musicGifs.length;
        const nextRef = gifRefs.current[nextIndex];

        if (currentRef && nextRef) {
          // Create smooth crossfade transition
          gsap.to(currentRef, {
            opacity: 0,
            duration: 1.2,
            ease: "power2.inOut"
          });

          gsap.fromTo(nextRef, 
            { opacity: 0 },
            { 
              opacity: 1, 
              duration: 1.2, 
              ease: "power2.inOut",
              delay: 0.3 // Slight overlap for smoother transition
            }
          );
        }

        setCurrentGifIndex(nextIndex);
      }, 3500); // Change GIF every 3.5 seconds for fluid transitions

      return () => clearInterval(interval);
    }
  }, [isLoaded, currentGifIndex, musicGifs.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white relative overflow-hidden">
      {/* Background Audio Waves Effect */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-purple-400/10 rounded-full animate-pulse"
            style={{
              width: `${20 + (i % 5) * 10}px`,
              height: `${20 + (i % 5) * 10}px`,
              left: `${(i * 7) % 100}%`,
              top: `${(i * 11) % 100}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${3 + (i % 3)}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div ref={containerRef} className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
            Music Sphere
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Audio production, sound design, and creative sonic explorations
          </p>
        </div>        {/* Main GIF Display - Landscape Mode with Fluid Transitions */}
        <div className="relative w-full max-w-6xl mx-auto mb-12">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-purple-500/30">
            {musicGifs.map((gifUrl, index) => (
              <div
                key={index}
                ref={(el) => { gifRefs.current[index] = el; }}
                className="absolute inset-0"
              >
                <img
                  src={gifUrl}
                  alt={`Music visualization ${index + 1}`}
                  className="w-full h-full object-cover"
                  style={{
                    filter: `hue-rotate(${index * 30}deg) saturate(1.3) brightness(1.1)`,
                  }}
                />
              </div>
            ))}
            
            {/* Overlay Effects */}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-pink-900/20 via-transparent to-purple-900/20" />
          </div>          {/* GIF Navigation Dots */}
          <div className="flex justify-center mt-6 space-x-3">
            {musicGifs.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  const currentRef = gifRefs.current[currentGifIndex];
                  const targetRef = gifRefs.current[index];

                  if (currentRef && targetRef && index !== currentGifIndex) {
                    // Smooth transition when manually selecting
                    gsap.to(currentRef, {
                      opacity: 0,
                      duration: 0.8,
                      ease: "power2.inOut"
                    });

                    gsap.fromTo(targetRef, 
                      { opacity: 0 },
                      { 
                        opacity: 1, 
                        duration: 0.8, 
                        ease: "power2.inOut",
                        delay: 0.2
                      }
                    );

                    setCurrentGifIndex(index);
                  }
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentGifIndex 
                    ? 'bg-purple-400 scale-125 shadow-lg' 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Music Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl mb-12">
          {[
            { title: "Electronic Beats", desc: "High-energy club vibes and electronic compositions" },
            { title: "DJ Productions", desc: "Professional mixing and live performance sets" },
            { title: "Sound Design", desc: "Creative audio engineering and experimental sounds" },
            { title: "Collaborations", desc: "Musical partnerships and featured productions" }
          ].map((item, index) => (
            <div
              key={index}
              className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover:bg-black/60 transition-all duration-300 hover:scale-105"
            >
              <h3 className="text-xl font-semibold text-purple-400 mb-3">{item.title}</h3>
              <p className="text-gray-300 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Current Track Info */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-4 bg-black/50 backdrop-blur-sm border border-purple-500/30 rounded-full px-6 py-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            <span className="text-purple-300 font-medium">
              Now Playing: Visualization {currentGifIndex + 1} of {musicGifs.length}
            </span>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Back to Portals */}
        <Link
          href="/portals"
          className="group inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-4 rounded-full font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/25"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Return to Dimensional Portals</span>
        </Link>
      </div>

      {/* Audio Wave Lines */}
      <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-gradient-to-t from-purple-500/30 to-transparent"
            style={{
              left: `${i * 2}%`,
              bottom: 0,
              width: '2px',
              height: `${20 + Math.sin(Date.now() * 0.001 + i * 0.5) * 40}px`,
              animation: `wave ${2 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}
