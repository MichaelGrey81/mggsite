"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  UserIcon,
  DocumentTextIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

// Register GSAP plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Enhanced Sacred Geometry Particle Background with Cursor Orbiting
const SacredGeometryParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      pulse: number;
      baseX: number;
      baseY: number;
      birthTime: number;
      energy: number;
      phase: number;
      orbitAngle: number;
      orbitRadius: number;
      isOrbiting: boolean;
      explosionVx: number;
      explosionVy: number;
    }> = [];

    const particleCount = 120;
    const connectionDistance = 140;
    const mouseInfluence = 120;
    const orbitDistance = 80;
    let startTime = Date.now();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.prevX = mouseRef.current.x;
      mouseRef.current.prevY = mouseRef.current.y;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Initialize particles for dramatic explosion
    const initializeParticles = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      for (let i = 0; i < particleCount; i++) {
        // Sacred geometry positioning (golden ratio spiral)
        const angle = i * 2.399; // Golden angle
        const radius = Math.sqrt(i) * 15;
        
        // Final distributed position
        const finalX = Math.random() * canvas.width;
        const finalY = Math.random() * canvas.height;
        
        // Explosion velocity (dramatic outward burst)
        const explosionAngle = Math.random() * Math.PI * 2;
        const explosionSpeed = Math.random() * 8 + 4; // More dramatic explosion
        
        particles.push({
          x: centerX,
          y: centerY,
          baseX: finalX,
          baseY: finalY,
          vx: 0,
          vy: 0,
          explosionVx: Math.cos(explosionAngle) * explosionSpeed,
          explosionVy: Math.sin(explosionAngle) * explosionSpeed,
          size: Math.random() * 2.5 + 1,
          alpha: Math.random() * 0.8 + 0.6,
          pulse: Math.random() * Math.PI * 2,
          birthTime: Date.now() + Math.random() * 500, // Staggered birth for explosion effect
          energy: 1.5 + Math.random() * 1, // Higher initial energy
          phase: i * 0.1,
          orbitAngle: Math.random() * Math.PI * 2,
          orbitRadius: Math.random() * 40 + 20,
          isOrbiting: false,
        });
      }
    };

    initializeParticles();

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      
      // Clear canvas completely (no trails)
      ctx.fillStyle = 'rgba(17, 24, 39, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle, index) => {
        const age = currentTime - particle.birthTime;
        if (age < 0) return;
        
        const explosionPhase = Math.min(age / 2000, 1); // 2 second explosion phase
        const settling = Math.min(Math.max(age - 2000, 0) / 3000, 1); // 3 second settling after explosion
        
        if (explosionPhase < 1) {
          // Explosion phase - dramatic outward movement
          particle.x += particle.explosionVx * (1 - explosionPhase);
          particle.y += particle.explosionVy * (1 - explosionPhase);
          particle.explosionVx *= 0.98; // Slow down explosion
          particle.explosionVy *= 0.98;
          particle.energy = 2 + Math.sin(elapsed * 0.01) * 0.5; // High energy during explosion
        } else {
          // Post-explosion behavior
          const dx = mouseRef.current.x - particle.x;
          const dy = mouseRef.current.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < orbitDistance && settling >= 0.5) {
            // Particle enters orbit
            particle.isOrbiting = true;
            particle.orbitAngle += 0.05 + (particle.energy * 0.02);
            
            // Calculate orbit position
            const orbitX = mouseRef.current.x + Math.cos(particle.orbitAngle) * particle.orbitRadius;
            const orbitY = mouseRef.current.y + Math.sin(particle.orbitAngle) * particle.orbitRadius;
            
            // Smooth transition to orbit
            particle.x += (orbitX - particle.x) * 0.12;
            particle.y += (orbitY - particle.y) * 0.12;
            
            particle.energy = Math.min(particle.energy + 0.08, 3);
          } else if (particle.isOrbiting && distance > orbitDistance * 1.5) {
            // Particle exits orbit
            particle.isOrbiting = false;
            particle.energy *= 0.95;
          } else if (!particle.isOrbiting) {
            // Enhanced floating behavior - more prominent movement
            const floatIntensity = 25; // Increased from 15
            const spiralX = Math.cos(elapsed * 0.0003 + particle.phase) * floatIntensity;
            const spiralY = Math.sin(elapsed * 0.0004 + particle.phase) * (floatIntensity * 0.7);
            
            // Additional drift motion
            const driftX = Math.sin(elapsed * 0.0002 + particle.phase * 2) * 20;
            const driftY = Math.cos(elapsed * 0.00025 + particle.phase * 1.5) * 15;
            
            // Gentle drift to final positions with enhanced movement
            const targetX = particle.baseX + spiralX + driftX;
            const targetY = particle.baseY + spiralY + driftY;
            
            // Smooth transition to floating positions
            particle.x += (targetX - particle.x) * 0.015 * settling;
            particle.y += (targetY - particle.y) * 0.015 * settling;

            // Mouse attraction for non-orbiting particles
            if (distance < mouseInfluence) {
              const force = (mouseInfluence - distance) / mouseInfluence * 0.25;
              const angle = Math.atan2(dy, dx);
              particle.x += Math.cos(angle) * force * 2;
              particle.y += Math.sin(angle) * force * 2;
              particle.energy = Math.min(particle.energy + force * 0.6, 2.5);
            }
            
            particle.energy *= 0.996; // Slower energy decay
          }
        }
        
        particle.pulse += 0.025 + (particle.energy * 0.015);

        // Enhanced rendering with energy-based effects
        const pulseAlpha = particle.alpha + Math.sin(particle.pulse) * 0.4 * particle.energy;
        const pulseSize = Math.max(particle.size + Math.sin(particle.pulse) * 0.5 * particle.energy, 0.1);

        // Dynamic color based on energy and orbit state
        const energyIntensity = particle.energy;
        const orbitGlow = particle.isOrbiting ? 1.8 : 1.2;
        
        // Outer glow with energy-based intensity
        const glowRadius = Math.max(pulseSize * 5 * orbitGlow, 0.1);
        if (glowRadius > 0) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, glowRadius, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, glowRadius
          );
          
          if (particle.isOrbiting) {
            gradient.addColorStop(0, `rgba(0, 255, 255, ${pulseAlpha * 0.2 * energyIntensity})`);
            gradient.addColorStop(0.6, `rgba(59, 130, 246, ${pulseAlpha * 0.12 * energyIntensity})`);
          } else {
            gradient.addColorStop(0, `rgba(59, 130, 246, ${pulseAlpha * 0.15 * energyIntensity})`);
            gradient.addColorStop(0.6, `rgba(37, 99, 235, ${pulseAlpha * 0.08 * energyIntensity})`);
          }
          gradient.addColorStop(1, `rgba(29, 78, 216, 0)`);
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        // Core particle with dynamic color
        const coreRadius = Math.max(pulseSize * 0.9, 0.1);
        if (coreRadius > 0) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, coreRadius, 0, Math.PI * 2);
          
          if (particle.isOrbiting) {
            ctx.fillStyle = `rgba(0, 255, 255, ${pulseAlpha})`;
          } else {
            ctx.fillStyle = `rgba(147, 197, 253, ${pulseAlpha})`;
          }
          ctx.fill();
        }

        // Energy burst for high-energy particles
        if (particle.energy > 1.8) {
          const burstRadius = Math.max(pulseSize * 1.8, 0.1);
          if (burstRadius > 0) {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, burstRadius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${(particle.energy - 1.8) * 0.4})`;
            ctx.fill();
          }
        }
      });

      // Enhanced connections with energy-based effects
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const alpha = (1 - distance / connectionDistance) * 0.2; // Slightly more visible
            const energyBoost = (particles[i].energy + particles[j].energy) / 2;
            const isSpecial = particles[i].isOrbiting || particles[j].isOrbiting;
            
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            
            if (isSpecial) {
              ctx.strokeStyle = `rgba(0, 255, 255, ${alpha * energyBoost})`;
              ctx.lineWidth = 1 + energyBoost * 0.4;
            } else {
              ctx.strokeStyle = `rgba(59, 130, 246, ${alpha * energyBoost})`;
              ctx.lineWidth = 0.6 + energyBoost * 0.3;
            }
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
      style={{ opacity: isMounted ? 0.6 : 0 }}
    />
  );
};

// Modern Skills Component with Multi-colored Hexagons
const ModernSkills = () => {
  const skillsRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const technicalSkills = [
    { name: "ERP Systems (SAP/Oracle)", level: 95, category: "enterprise" },
    { name: "Advanced Excel & VBA", level: 98, category: "analysis" },
    { name: "Power BI & Tableau", level: 92, category: "visualization" },
    { name: "SQL & Database Management", level: 85, category: "data" },
    { name: "Python & Automation", level: 78, category: "programming" },
    { name: "EDI & Integration", level: 88, category: "systems" },
  ];

  const coreCompetencies = [
    { name: "Demand Planning & Forecasting", level: 98, category: "forecasting" },
    { name: "Inventory Optimization", level: 96, category: "inventory" },
    { name: "Vendor Relations & Sourcing", level: 94, category: "sourcing" },
    { name: "Distribution Network Design", level: 92, category: "logistics" },
    { name: "Process Improvement (Lean/Six Sigma)", level: 90, category: "process" },
    { name: "Cross-Functional Team Leadership", level: 88, category: "leadership" },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (skillsRef.current) {
      observer.observe(skillsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const SkillHexagon = ({ skill, level, delay, category }: { 
    skill: string; 
    level: number; 
    delay: number; 
    category: string;
  }) => {
    const hexRef = useRef<HTMLDivElement>(null);
    const [currentLevel, setCurrentLevel] = useState(0);

    useEffect(() => {
      if (isVisible) {
        setTimeout(() => {
          const interval = setInterval(() => {
            setCurrentLevel(prev => {
              if (prev >= level) {
                clearInterval(interval);
                return level;
              }
              return prev + 2;
            });
          }, 20);
        }, delay);
      }
    }, [isVisible, level, delay]);

    const getCategoryColor = (cat: string) => {
      const colors = {
        enterprise: { primary: '#3b82f6', secondary: '#06b6d4', bg: 'from-blue-500 to-cyan-500' },
        analysis: { primary: '#8b5cf6', secondary: '#ec4899', bg: 'from-purple-500 to-pink-500' },
        visualization: { primary: '#10b981', secondary: '#059669', bg: 'from-green-500 to-emerald-500' },
        data: { primary: '#f59e0b', secondary: '#ea580c', bg: 'from-yellow-500 to-orange-500' },
        programming: { primary: '#ef4444', secondary: '#f43f5e', bg: 'from-red-500 to-rose-500' },
        systems: { primary: '#6366f1', secondary: '#8b5cf6', bg: 'from-indigo-500 to-purple-500' },
        forecasting: { primary: '#2563eb', secondary: '#4f46e5', bg: 'from-blue-600 to-indigo-600' },
        inventory: { primary: '#059669', secondary: '#047857', bg: 'from-emerald-600 to-green-600' },
        sourcing: { primary: '#d97706', secondary: '#b45309', bg: 'from-amber-600 to-yellow-600' },
        logistics: { primary: '#7c3aed', secondary: '#8b5cf6', bg: 'from-purple-600 to-violet-600' },
        process: { primary: '#0891b2', secondary: '#0284c7', bg: 'from-cyan-600 to-blue-600' },
        leadership: { primary: '#dc2626', secondary: '#e11d48', bg: 'from-rose-600 to-pink-600' },
      };
      return colors[cat as keyof typeof colors] || { primary: '#6b7280', secondary: '#4b5563', bg: 'from-gray-500 to-gray-600' };
    };

    const categoryColor = getCategoryColor(category);

    return (
      <div className="flex flex-col items-center group cursor-pointer">
        <div 
          ref={hexRef}
          className="relative w-24 h-24 mb-3 transition-all duration-300 hover:scale-110"
        >
          <div className="absolute inset-0 bg-gray-800/60 transform rotate-45 rounded-lg border border-gray-700/30" />
          
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgba(75, 85, 99, 0.3)"
              strokeWidth="3"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - currentLevel / 100)}`}
              className="transition-all duration-1000 ease-out"
              style={{
                stroke: categoryColor.primary,
                filter: `drop-shadow(0 0 6px ${categoryColor.primary}40)`,
              }}
            />
          </svg>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-sm">{currentLevel}%</span>
          </div>
          
          <div 
            className={`absolute inset-0 rounded-lg bg-gradient-to-r ${categoryColor.bg} opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-30`}
            style={{ 
              transform: 'scale(1.1)',
              zIndex: -1,
            }}
          />
        </div>
        
        <p className="text-center text-sm font-medium text-gray-200 max-w-[120px] leading-tight">
          {skill}
        </p>
      </div>
    );
  };

  return (
    <div ref={skillsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <ChartBarIcon className="h-5 w-5 text-blue-400 mr-2" />
          Technical Expertise
        </h3>
        <div className="grid grid-cols-2 gap-6">
          {technicalSkills.map((skill, index) => (
            <SkillHexagon
              key={skill.name}
              skill={skill.name}
              level={skill.level}
              delay={index * 150}
              category={skill.category}
            />
          ))}
        </div>
      </div>

      <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <BriefcaseIcon className="h-5 w-5 text-blue-400 mr-2" />
          Core Competencies
        </h3>
        <div className="grid grid-cols-2 gap-6">
          {coreCompetencies.map((skill, index) => (
            <SkillHexagon
              key={skill.name}
              skill={skill.name}
              level={skill.level}
              delay={index * 150 + 900}
              category={skill.category}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const resumeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (heroRef.current && resumeRef.current) {
      // Hide text initially
      gsap.set(heroRef.current.querySelector("h1"), { opacity: 0, y: 30 });
      gsap.set(heroRef.current.querySelector("p"), { opacity: 0, y: 30 });
      gsap.set(heroRef.current.querySelector(".subtitle"), { opacity: 0, y: 30 });

      // Delayed text animations - after particle explosion
      const textTimeline = gsap.timeline({ delay: 2.5 }); // Wait for explosion to spread
      
      textTimeline
        .to(heroRef.current.querySelector("h1"), {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power2.out"
        })
        .to(heroRef.current.querySelector("p"), {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out"
        }, "-=0.6") // Start before previous animation ends
        .to(heroRef.current.querySelector(".subtitle"), {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out"
        }, "-=0.4"); // Start before previous animation ends

      // Scroll-triggered morph transition
      gsap.timeline({
        scrollTrigger: {
          trigger: resumeRef.current,
          start: "top bottom",
          end: "top center",
          scrub: 1,
          onUpdate: (self) => {
            const progress = self.progress;
            
            // Fade out hero content
            gsap.to(heroRef.current, {
              opacity: 1 - progress,
              y: -50 * progress,
              scale: 1 - 0.1 * progress,
              duration: 0.1,
            });

            // Fade in resume content
            gsap.to(resumeRef.current, {
              opacity: progress,
              y: 50 * (1 - progress),
              duration: 0.1,
            });
          }
        }
      });

      // Individual resume block animations
      const blocks = resumeRef.current.querySelectorAll('.resume-block');
      blocks.forEach((block, index) => {
        gsap.fromTo(
          block,
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            delay: index * 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: block,
              start: "top 80%",
              toggleActions: "play none none reverse"
            }
          }
        );
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans relative">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="fixed inset-0 flex flex-col items-center justify-center text-center px-4 z-10"
      >
        <SacredGeometryParticles />
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-white">
            Michael G. Gambrell
          </h1>
          <p className="text-lg md:text-xl text-gray-300 font-medium mb-8" 
             style={{ 
               textShadow: '0 0 12px rgba(59, 130, 246, 0.5), 0 0 24px rgba(59, 130, 246, 0.3), 0 0 36px rgba(59, 130, 246, 0.1)' 
             }}>
            Supply Chain & Forecasting Expert
          </p>
          <p className="subtitle text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
            20+ years transforming industrial distribution operations through advanced 
            analytics, strategic forecasting, and data-driven supply chain optimization
          </p>
        </div>
      </section>

      {/* Spacer for scroll trigger */}
      <div className="h-screen"></div>

      {/* Main Resume Content */}
      <section
        ref={resumeRef}
        className="relative bg-gray-800/50 backdrop-blur-sm opacity-0 z-20"
        style={{ minHeight: '200vh' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Contact, Photo & Summary */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Photo */}
              <div className="resume-block bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 p-1">
                  <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center">
                    <img src="/mgg.png" alt="Michael G. Gambrell" className="w-full h-full rounded-full object-cover" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white">Michael G. Gambrell</h3>
                <p className="text-blue-300 text-sm"
                   style={{ 
                     textShadow: '0 0 8px rgba(59, 130, 246, 0.4), 0 0 16px rgba(59, 130, 246, 0.2)' 
                   }}>
                  Supply Chain & Forecasting Expert
                </p>
              </div>

              {/* Contact Information */}
              <div className="resume-block bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <UserIcon className="h-5 w-5 text-blue-400 mr-2" />
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span className="text-gray-300">Dallas, TX</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span className="text-gray-300">(555) 123-4567</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span className="text-gray-300">michael.gambrell@email.com</span>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div className="resume-block bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <AcademicCapIcon className="h-5 w-5 text-blue-400 mr-2" />
                  Education
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-white">Master of Business Administration</h3>
                    <p className="text-blue-300 text-sm">University of Texas at Dallas</p>
                    <p className="text-gray-400 text-sm">2015 • Supply Chain Management</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Bachelor of Science</h3>
                    <p className="text-blue-300 text-sm">Business Administration</p>
                    <p className="text-gray-400 text-sm">1998</p>
                  </div>
                </div>
              </div>

              {/* Key Achievements */}
              <div className="resume-block bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                <h2 className="text-xl font-semibold text-white mb-6">Key Achievements</h2>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300 text-sm">35% improvement in forecast accuracy through advanced modeling</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300 text-sm">$3.2M annual cost reduction in distribution operations</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300 text-sm">Managed $75M+ in annual procurement spend</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300 text-sm">Led digital transformation initiatives across 5 facilities</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Experience & Skills */}
            <div className="lg:col-span-2 space-y-8">
              {/* Professional Summary */}
              <div className="resume-block bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-blue-400 mr-2" />
                  Professional Summary
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Accomplished supply chain and forecasting expert with over 20 years of progressive experience in 
                  industrial distribution, logistics, and operations management. Proven expertise in demand planning, 
                  inventory optimization, and vendor relationship management with a demonstrated track record of delivering 
                  measurable business impact through advanced analytics and strategic process improvement. Expert in ERP 
                  systems, data visualization, and cross-functional team leadership with extensive experience in 
                  manufacturing, distribution, and industrial supply chain environments.
                </p>
              </div>

              {/* Experience */}
              <div className="resume-block bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <BriefcaseIcon className="h-5 w-5 text-blue-400 mr-2" />
                  Professional Experience
                </h2>
                <div className="space-y-6">
                  <div className="border-l-2 border-blue-400 pl-4">
                    <h3 className="font-semibold text-white">Supply Chain & Forecasting Expert</h3>
                    <p className="text-blue-300 text-sm mb-2">Leading Industrial Distribution Company • 2018 - Present</p>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Developed advanced forecasting models improving demand accuracy by 35% across 200+ product lines</li>
                      <li>• Optimized inventory management strategies reducing carrying costs by $3.2M annually</li>
                      <li>• Led vendor consolidation initiative reducing supplier base by 40% while improving service levels</li>
                      <li>• Implemented automated reporting dashboards using Power BI, reducing manual analysis time by 75%</li>
                      <li>• Managed strategic procurement for $75M+ annual spend across industrial components and MRO supplies</li>
                    </ul>
                  </div>

                  <div className="border-l-2 border-blue-500 pl-4">
                    <h3 className="font-semibold text-white">Senior Operations Analyst</h3>
                    <p className="text-blue-300 text-sm mb-2">Multi-Location Industrial Distributor • 2012 - 2018</p>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Designed and implemented distribution network optimization reducing logistics costs by 28%</li>
                      <li>• Led ERP system migration project for 5 facilities with zero operational downtime</li>
                      <li>• Developed KPI frameworks and executive dashboards for supply chain performance monitoring</li>
                      <li>• Managed cross-functional teams to streamline order fulfillment processes improving efficiency by 45%</li>
                    </ul>
                  </div>

                  <div className="border-l-2 border-cyan-400 pl-4">
                    <h3 className="font-semibold text-white">Distribution Operations Manager</h3>
                    <p className="text-cyan-300 text-sm mb-2">Regional Industrial Supply Company • 2006 - 2012</p>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Managed daily operations for 150,000 sq ft distribution center processing 2,000+ orders daily</li>
                      <li>• Implemented lean principles and Six Sigma methodologies improving operational efficiency by 35%</li>
                      <li>• Developed vendor scorecarding system improving supplier performance and reducing defects by 60%</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <div className="resume-block bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                <h2 className="text-xl font-semibold text-white mb-6">Technical Skills & Core Competencies</h2>
                <ModernSkills />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}