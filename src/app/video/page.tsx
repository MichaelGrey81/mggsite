// src/app/video/page.tsx
"use client";

import BackgroundVideo from "@/components/BackgroundVideo";

export default function VideoPage() {
  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background Video */}
      <BackgroundVideo src="/vidya.mp4" opacity={0.5} />

      {/* Overlay Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 space-y-4">
        <h1 className="text-4xl font-bold">Immersive Background Video</h1>
        <p className="text-xl">Experience the power of intelligent inventory management.</p>
      </div>
    </div>
  );
}
