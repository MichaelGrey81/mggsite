"use client"
import { motion } from 'framer-motion'
import { LucideIcon  } from "lucide-react"

interface FeatureCardProps {
    icon: LucideIcon;
    title: string; // FIXED: it was "ttle"
    description: string;
}

export default function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
    return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.03 }}
      className="bg-white rounded-lg shadow-md p-6 w-full max-w-sm flex flex-col items-start justify-start gap-4 transition"
    >
      <Icon className="text-gray-700 w-6 h-6" />
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </motion.div>
  );
}
