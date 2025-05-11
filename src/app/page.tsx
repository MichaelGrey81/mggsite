"use client";

import { useState } from "react";
import Hero from "@/components/Hero";
import LandingComponent from "@/components/LandingComponent";

export default function Home() {
  const [heroAnimationFinished, setHeroAnimationFinished] = useState(false);

  return (
    <>
      {!heroAnimationFinished && (
        <Hero onAnimationComplete={() => setHeroAnimationFinished(true)} />
      )}
      {heroAnimationFinished && <LandingComponent />}
    </>
  );
}
