"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import Link from "next/link";

// Chakra Meditation Experience Background
const ChakraMeditationCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const waterDroplets: Array<{
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      alpha: number;
      speed: number;
      ripples: Array<{ radius: number; alpha: number }>;
    }> = [];

    const floatingParticles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: { r: number; g: number; b: number };
      pulse: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);    // Initialize water droplets and floating particles
    const initializeEffects = () => {
      // Create slower, larger, more spread out water droplets
      for (let i = 0; i < 8; i++) {
        // Use deterministic positioning based on index to avoid hydration issues
        const seed1 = (i * 123.456) % 1;
        const seed2 = (i * 789.123) % 1;
        const seed3 = (i * 456.789) % 1;
        const seed4 = (i * 321.654) % 1;
        
        waterDroplets.push({
          x: seed1 * canvas.width,
          y: seed2 * canvas.height,
          radius: 0,
          maxRadius: 120 + seed3 * 100, // Larger ripples
          alpha: 0.3, // Much lower opacity
          speed: 0.15 + seed4 * 0.2, // Slower speed
          ripples: []
        });
      }      // Create softer cosmic floating particles
      for (let i = 0; i < 80; i++) { // Increased count
        // Use deterministic values based on index
        const seed1 = (i * 234.567) % 1;
        const seed2 = (i * 678.901) % 1;
        const seed3 = (seed1 - 0.5) * 0.8; // Faster movement
        const seed4 = (seed2 - 0.5) * 0.8;
        const seed5 = (i * 567.890) % 1;
        const seed6 = (i * 890.123) % 1;
        const seed7 = (i * 135.246) % 1;
        const seed8 = (i * 468.579) % 1;
        const seed9 = (i * 802.357) % 1;
        
        floatingParticles.push({
          x: seed1 * canvas.width,
          y: seed2 * canvas.height,
          vx: seed3, // Faster movement
          vy: seed4,
          size: seed5 * 3 + 1, // Larger particles
          alpha: seed6 * 0.6 + 0.2, // Higher opacity
          color: {
            r: 80 + seed7 * 175, // Brighter colors
            g: 120 + seed8 * 135,
            b: 180 + seed9 * 75
          },
          pulse: (i * 987.654) % (Math.PI * 2)
        });
      }
    };

    initializeEffects();

    const animate = () => {
      const currentTime = Date.now();
      
      // Create serene water background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(15, 23, 42, 1)');   // Deep blue-gray
      gradient.addColorStop(0.5, 'rgba(30, 41, 59, 1)'); // Slate
      gradient.addColorStop(1, 'rgba(51, 65, 85, 1)');   // Lighter slate
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add subtle stars/light points
      for (let i = 0; i < 60; i++) {
        const x = (currentTime * 0.01 + i * 123.456) % canvas.width;
        const y = (currentTime * 0.008 + i * 789.123) % canvas.height;
        const alpha = Math.sin(currentTime * 0.002 + i) * 0.3 + 0.4;
        
        ctx.fillStyle = `rgba(200, 220, 255, ${alpha * 0.5})`;
        ctx.fillRect(x, y, 1, 1);
      }      // Update and render water droplets with slower, smoother ripples
      waterDroplets.forEach((droplet, index) => {
        droplet.radius += droplet.speed;
        droplet.alpha = Math.max(0, 0.8 - (droplet.radius / droplet.maxRadius)); // Slower fade        // Create new ripples with slower timing
        if (droplet.radius < droplet.maxRadius && (currentTime + index * 1000) % 800 < 64) { // More predictable timing
          droplet.ripples.push({ radius: droplet.radius * 0.2, alpha: 0.4 }); // Lower alpha
        }

        // Update ripples with smoother physics
        droplet.ripples = droplet.ripples.filter(ripple => {
          ripple.radius += 1.5; // Slower expansion
          ripple.alpha *= 0.96; // Slower fade
          
          if (ripple.alpha > 0.005) {
            // Smoother, more subtle ripple rings
            for (let r = 0; r < 4; r++) {
              const rippleRadius = ripple.radius + (r * 20);
              const rippleAlpha = ripple.alpha * (0.6 - r * 0.1);
              
              ctx.strokeStyle = `rgba(100, 180, 255, ${rippleAlpha * 0.2})`; // Much lower opacity
              ctx.lineWidth = 3 - r * 0.5;
              ctx.beginPath();
              ctx.arc(droplet.x, droplet.y, rippleRadius, 0, Math.PI * 2);
              ctx.stroke();
                // Subtle inner highlight (only if radius is large enough)
              if (rippleRadius > 3) {
                ctx.strokeStyle = `rgba(150, 200, 255, ${rippleAlpha * 0.1})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(droplet.x, droplet.y, rippleRadius - 2, 0, Math.PI * 2);
                ctx.stroke();
              }
            }
            return true;
          }
          return false;
        });

        // Enhanced main droplet circle with more subtle appearance
        if (droplet.alpha > 0) {
          const rippleGradient = ctx.createRadialGradient(
            droplet.x, droplet.y, 0,
            droplet.x, droplet.y, droplet.radius
          );
          rippleGradient.addColorStop(0, `rgba(140, 200, 255, ${droplet.alpha * 0.1})`);
          rippleGradient.addColorStop(0.4, `rgba(100, 170, 255, ${droplet.alpha * 0.08})`);
          rippleGradient.addColorStop(0.8, `rgba(80, 140, 255, ${droplet.alpha * 0.04})`);
          rippleGradient.addColorStop(1, `rgba(100, 180, 255, 0)`);
          
          ctx.fillStyle = rippleGradient;
          ctx.beginPath();
          ctx.arc(droplet.x, droplet.y, droplet.radius, 0, Math.PI * 2);
          ctx.fill();
          
          // Subtle center highlight
          const centerGradient = ctx.createRadialGradient(
            droplet.x - droplet.radius * 0.3, droplet.y - droplet.radius * 0.3, 0,
            droplet.x, droplet.y, droplet.radius * 0.6
          );
          centerGradient.addColorStop(0, `rgba(200, 230, 255, ${droplet.alpha * 0.15})`);
          centerGradient.addColorStop(1, `rgba(200, 230, 255, 0)`);
          
          ctx.fillStyle = centerGradient;
          ctx.beginPath();
          ctx.arc(droplet.x, droplet.y, droplet.radius * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }        // Reset droplet when it fades out
        if (droplet.alpha <= 0.02) {
          // Use deterministic repositioning
          const resetSeed1 = ((index * 987.654) + currentTime * 0.0001) % 1;
          const resetSeed2 = ((index * 654.321) + currentTime * 0.0001) % 1;
          
          droplet.x = resetSeed1 * canvas.width;
          droplet.y = resetSeed2 * canvas.height;
          droplet.radius = 0;
          droplet.alpha = 0.3;
          droplet.ripples = [];
        }
      });      // Update and render floating particles
      floatingParticles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.pulse += 0.03; // Faster pulsing

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Enhanced pulsing alpha effect
        const pulseAlpha = particle.alpha * (0.5 + 0.5 * Math.sin(particle.pulse));

        // Main particle with glow
        ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${pulseAlpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Larger glow effect
        ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${pulseAlpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Outer subtle glow
        ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${pulseAlpha * 0.1})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 6, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0"
      style={{ 
        opacity: isMounted ? 0.6 : 0,
        width: '100vw',
        height: '100vh',
        minHeight: '100vh'
      }}
    />
  );
};

// Dimensional Portal Gateway Component
const PortalGateway = ({ 
  title, 
  description, 
  href, 
  color, 
  delay,
  particles,
  isMusic = false
}: { 
  title: string; 
  description: string; 
  href: string; 
  color: string;
  delay: number;
  particles: string;
  isMusic?: boolean;
}) => {  const portalRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [currentGifIndex, setCurrentGifIndex] = useState(0);
  // Music GIFs - using your actual GIF files
  const musicGifs = [
    "/gifs/20250603_2306_Electrifying Club Vibes_simple_compose_01jwwhwykqe4zrs9bnkt15j6xg (1).gif",
    "/gifs/20250603_2310_DJ Night Extravaganza_simple_compose_01jwwj4xvtfv6sr7dqpbejq7ns.gif",
    "/gifs/20250603_2328_Blend Video_blend_01jwwk5yawed2s7afhd6x4ntwe.gif",
    "/gifs/20250603_2331_Blend Video_blend_01jwwkb3znfht89fapwd6t983n.gif"
  ];  useEffect(() => {
    if (portalRef.current) {
      gsap.fromTo(
        portalRef.current,
        { 
          opacity: 0, 
          scale: 0.3, // Start much smaller for explosive effect
          filter: "blur(8px)"
        },
        {
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.8, // Slightly longer for dramatic effect
          delay: delay,
          ease: "back.out(1.2)", // Add slight bounce for explosion feel
        }
      );
    }
  }, [delay]);

  // GIF rotation effect for Music Sphere
  useEffect(() => {
    if (isMusic && musicGifs.length > 1) {
      const interval = setInterval(() => {
        setCurrentGifIndex((prev) => (prev + 1) % musicGifs.length);
      }, 3000); // Change GIF every 3 seconds

      return () => clearInterval(interval);
    }
  }, [isMusic, musicGifs.length]);const handlePortalClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (portalRef.current) {
      // Fade out all other portals
      const allPortals = document.querySelectorAll('.portal-gateway');
      allPortals.forEach((portal) => {
        if (portal !== portalRef.current) {
          gsap.to(portal, {
            opacity: 0,
            scale: 0.8,
            duration: 0.6,
            ease: "power2.out"
          });
        }
      });

      // Create warp effect on clicked portal - scale from center
      gsap.to(portalRef.current, {
        scale: 20,
        opacity: 0,
        duration: 1.2,
        ease: "power2.in",
        transformOrigin: "center center",
        onComplete: () => {
          window.location.href = href;
        }
      });

      // Create screen warp effect
      const warpElement = document.createElement('div');
      warpElement.className = 'warp-transition';
      warpElement.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 9999;
        background: radial-gradient(circle, ${color}40 0%, ${color}20 30%, transparent 70%);
      `;
      document.body.appendChild(warpElement);
      
      gsap.fromTo(warpElement, 
        { scale: 0, opacity: 0 },
        { 
          scale: 4, 
          opacity: 1, 
          duration: 1.2,
          ease: "power2.out",
          onComplete: () => warpElement.remove()
        }
      );
    }
  };  return (
    <div
      ref={portalRef}
      className="portal-gateway group relative cursor-pointer transform-gpu"
      style={{ opacity: 0, transform: 'scale(0.3)', filter: 'blur(8px)' }} // Force initial hidden state
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePortalClick}
    >{/* Portal Ripple Frame - Like Ripples in Universe */}
      <div 
        className={`relative w-32 h-32 rounded-full transition-all duration-700 ${
          isHovered ? 'scale-110' : 'scale-100'
        }`}
        style={{
          background: `radial-gradient(circle, ${color}20 0%, ${color}10 40%, transparent 80%)`,
          boxShadow: isHovered 
            ? `0 0 80px ${color}60, 0 0 120px ${color}40, inset 0 0 60px ${color}30` 
            : `0 0 40px ${color}40, 0 0 80px ${color}20, inset 0 0 30px ${color}20`,
        }}
      >
        {/* Multiple Ripple Rings */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`absolute border border-opacity-20 rounded-full transition-all duration-500 ${
              isHovered ? 'border-opacity-60' : 'border-opacity-20'
            }`}
            style={{
              inset: `${i * 20}px`,
              borderColor: color,
              animation: `ripple-${i % 3} ${6 + i}s infinite linear`,
              animationDelay: `${i * 0.3}s`
            }}
          />
        ))}        {/* Rotating Portal Rings */}
        <div className="absolute inset-4">
          <div 
            className={`w-full h-full rounded-full border-2 transition-all duration-500 animate-spin ${
              isHovered ? 'border-opacity-80' : 'border-opacity-40'
            }`}
            style={{ 
              animationDuration: '15s',
              borderColor: isHovered ? '#ffffff80' : color + '60'
            }}
          />
        </div>
        
        <div className="absolute inset-8">
          <div 
            className={`w-full h-full rounded-full border transition-all duration-500 ${
              isHovered ? 'border-opacity-60' : 'border-opacity-30'
            }`}
            style={{ 
              animation: 'spin 20s linear infinite reverse',
              borderColor: isHovered ? '#ffffff40' : color + '40'
            }}
          />
        </div>        {/* Portal Center with Depth */}
        <div className="absolute inset-12 flex items-center justify-center">
          {isMusic ? (
            // Music Sphere with rotating GIFs
            <div className="relative w-full h-full rounded-full overflow-hidden">
              {musicGifs.map((gifUrl, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentGifIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img
                    src={gifUrl}
                    alt={`Music visualization ${index + 1}`}
                    className="w-full h-full object-cover rounded-full"
                    style={{
                      filter: `hue-rotate(${index * 45}deg) saturate(1.2)`,
                      mixBlendMode: 'screen'
                    }}
                  />
                </div>
              ))}
              {/* Overlay for portal effect */}
              <div 
                className={`absolute inset-0 rounded-full transition-all duration-700 ${
                  isHovered ? 'scale-125' : 'scale-100'
                }`}
                style={{
                  background: `radial-gradient(circle, ${color}40 0%, ${color}20 30%, transparent 60%)`,
                  filter: isHovered ? 'blur(0.5px)' : 'blur(1px)',
                  boxShadow: `inset 0 0 20px ${color}40`
                }}
              />
            </div>
          ) : (
            // Regular portal center
            <div 
              className={`w-full h-full rounded-full transition-all duration-700 ${
                isHovered ? 'scale-125' : 'scale-100'
              }`}
              style={{
                background: `radial-gradient(circle, ${color}80 0%, ${color}60 30%, ${color}20 60%, transparent 100%)`,
                filter: isHovered ? 'blur(0.5px)' : 'blur(1px)',
                boxShadow: `inset 0 0 40px ${color}60`
              }}
            />
          )}
        </div>{/* Floating Energy Particles */}
        <div className="absolute inset-0 overflow-hidden rounded-full">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 rounded-full transition-all duration-500 ${
                isHovered ? 'opacity-100 scale-110' : 'opacity-60 scale-100'
              }`}
              style={{
                backgroundColor: color,
                left: `${20 + (i * 8)}%`,
                top: `${25 + ((i * 7) % 40)}%`,
                animation: `float ${4 + (i % 4)}s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
                filter: `drop-shadow(0 0 3px ${color})`,
                transform: `rotate(${i * 45}deg) translateX(${10 + (i % 2) * 5}px)`
              }}
            />
          ))}
        </div>

        {/* Particle Type Indicator */}
        <div className="absolute top-2 right-2 text-xs text-white/70 bg-black/60 px-2 py-1 rounded-full backdrop-blur-sm border border-white/20">
          {particles}
        </div>
      </div>      {/* Portal Info */}
      <div className="mt-4 text-center w-full">
        <h3 className={`text-lg font-semibold transition-all duration-300 ${
          isHovered ? 'text-white scale-105' : 'text-gray-200 scale-100'
        }`}>
          {title}
        </h3>
        <p className="text-gray-400 text-xs mt-2 mx-auto leading-relaxed line-clamp-3">
          {description}
        </p>
        
        {/* Portal Energy Indicator */}
        <div className="mt-3 mx-auto w-24 h-1 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm">
          <div 
            className={`h-full transition-all duration-1000 ${
              isHovered ? 'w-full' : 'w-1/3'
            }`}
            style={{ 
              backgroundColor: color,
              filter: `drop-shadow(0 0 4px ${color})`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default function PortalsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigationRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  useEffect(() => {
    // Immediately start the loading process
    const timer = setTimeout(() => {
      setIsLoaded(true);
      setIsAnimationComplete(true); // Enable the main content to render
      
      if (containerRef.current && navigationRef.current) {
        // Animate in the content immediately when loaded
        gsap.to(containerRef.current, { 
          opacity: 1, 
          visibility: 'visible',
          duration: 1.5, 
          ease: "power2.out",
          delay: 0
        });
        
        // Navigation help appears slightly after
        gsap.to(navigationRef.current, { 
          opacity: 1, 
          duration: 1, 
          ease: "power2.out",
          delay: 0.8
        });
      }
    }, 50); // Minimal delay to ensure DOM is ready

    return () => clearTimeout(timer);
  }, []);

  const portals = [
    {
      title: "Professional Realm",
      description: "Supply chain expertise, forecasting mastery, and corporate achievements",
      href: "/",
      color: "#3b82f6",
      particles: "Sacred Geometry"
    },
    {
      title: "BBQ Universe",
      description: "Smoky adventures, flavor mastery, and culinary passion projects",
      href: "/bbq",
      color: "#f59e0b",
      particles: "Smoke & Fire"
    },
    {
      title: "Tools Dimension",
      description: "Development projects, automation tools, and technical creations",
      href: "/tools",
      color: "#10b981",
      particles: "Code Matrix"
    },
    {
      title: "Music Sphere",
      description: "Audio production, sound design, and creative sonic explorations",
      href: "/music",
      color: "#8b5cf6",
      particles: "Sound Waves"
    },
    {
      title: "Creative Nexus",
      description: "Photography, design work, and artistic expressions",
      href: "/creative",
      color: "#ec4899",
      particles: "Light Prisms"
    }
  ];  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <ChakraMeditationCanvas />      {/* Main Content */}
      {isAnimationComplete && (
        <div
          ref={containerRef}
          className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-8 py-12 sm:py-16"
        >{/* Horizontal Portal Layout */}
          <div className="relative w-full max-w-7xl mx-auto flex items-center justify-center">
            <div className="flex justify-center items-center gap-6 lg:gap-8 py-8">
              {portals.map((portal, index) => (
                <div
                  key={portal.title}
                  className="flex-shrink-0 w-40 flex flex-col items-center"
                  style={{ alignSelf: 'center' }}
                >
                  <PortalGateway
                    title={portal.title}
                    description={portal.description}
                    href={portal.href}
                    color={portal.color}
                    particles={portal.particles}
                    delay={index * 0.15} // Much shorter delays for explosion effect
                    isMusic={portal.title === "Music Sphere"}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Help */}
          <div ref={navigationRef} className="mt-12 text-center">
            <p className="text-gray-500 text-sm tracking-wide">
              Hover to activate dimensional gateways • Click to warp through space-time
            </p>
          </div>
        </div>
      )}      {/* Cosmic Ambient Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-5">
        {Array.from({ length: 50 }).map((_, i) => {
          // Use deterministic positioning to avoid hydration errors
          const xPos = ((i * 123.456) % 1) * 100;
          const yPos = ((i * 789.123) % 1) * 100;
          const animDelay = ((i * 456.789) % 1) * 8;
          const animDuration = ((i * 987.654) % 1) * 6 + 8;
          const size = ((i * 321.987) % 1) * 2 + 1; // Variable sizes
          
          return (
            <div
              key={i}
              className="absolute bg-blue-100/40 rounded-full animate-float"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${xPos}%`,
                top: `${yPos}%`,
                animationDelay: `${animDelay}s`,
                animationDuration: `${animDuration}s`,
                filter: 'drop-shadow(0 0 4px rgba(100,150,255,0.6))',
                boxShadow: `0 0 ${size * 2}px rgba(100,150,255,0.3)`
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
