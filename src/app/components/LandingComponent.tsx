"use client";

import { motion } from "framer-motion";
import FeatureCard from "@/components/FeatureCard";
import { Package, BarChart3, FileUp } from "lucide-react"; // example icons

const features = [
  {
    icon: BarChart3,
    title: "Smart Reorder Planning",
 
    description: "Stop guessing order points. Plan based on usage and risk.",
  },
  {
    icon: Package,
    title: "Overstock Detection",
   
    description: "Know what’s aging, where. Rebalance before it’s dead.",
  },
  {
    icon: FileUp,
    title: "Import from CSV",

    description: "Upload ERP dumps — no special formats needed.",
  },
];

function LandingComponent() {
  console.log("LandingComponent Loaded");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }} // Added transition for smoother fade-in
      className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-20" // Added z-index just in case
    >
      <div className="p-8 text-center">
        <h2 className="text-3xl text-black font-bold mb-4">Let's understand your inventroy</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default LandingComponent;
