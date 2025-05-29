// src/app/components/FeatureCard.tsx
"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}

export default function FeatureCard({ icon: Icon, title, description, onClick }: FeatureCardProps) {
  return (
    <motion.div
      className="bg-gray-800/40 backdrop-blur-md p-6 rounded-xl border border-gray-700/30 hover:border-blue-500/40 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg h-[200px] flex flex-col"
      onClick={onClick}
      whileHover={{ y: -8, scale: 1.03, boxShadow: "0 8px 32px rgba(59, 130, 246, 0.2)" }}
    >
      <Icon className="w-8 h-8 text-blue-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-100 mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}