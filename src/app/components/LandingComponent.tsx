// // src/app/components/LandingComponent.tsx
// "use client";

// import { motion } from "framer-motion";
// import FeatureCard from "@/components/FeatureCard";
// import { TrendingUp, Package2, FileSearch, MessageCircle, ChevronRight } from "lucide-react";
// import { useRouter } from "next/navigation";

// const features = [
//   {
//     icon: TrendingUp,
//     title: "Smart Reordering 📈",
//     description: "Predict reorder points with precision using trends and lead times.",
//     route: "/reorder-planning",
//   },
//   {
//     icon: Package2,
//     title: "Overstock Alerts 📦",
//     description: "Catch slow movers early and rebalance before they drag you down.",
//     route: "/overstock",
//   },
//   {
//     icon: FileSearch,
//     title: "ABC Insights 🔍",
//     description: "Rank items by usage, cost, and sales frequency—automatically.",
//     route: "/abc-rank",
//   },
//   {
//     icon: MessageCircle,
//     title: "AI Chat 💬",
//     description: "Upload your data and ask Optix anything about your inventory.",
//     route: "/chat",
//   },
// ];

// export default function LandingComponent() {
//   const router = useRouter();

//   const handleFeatureClick = (feature: any) => {
//     if (feature.route) {
//       router.push(feature.route);
//     }
//   };

//   return (
//     <div className="relative min-h-screen bg-gradient-to-br from-gray-900/95 to-gray-950/95 text-gray-100 flex flex-col items-center justify-center py-12 px-6 overflow-hidden">
//       {/* Header with Fade-In Animation */}
//       <div className="relative mb-10">
//         <motion.h2
//           className="text-4xl md:text-5xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300 leading-tight"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 1, ease: "easeOut" }}
//         >
//           Master Your Inventory with Optimal Inventory Intelligence
//         </motion.h2>
//       </div>

//       {/* Feature Grid */}
//       <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl w-full px-4">
//         {features.map((feature, index) => (
//           <motion.div
//             key={index}
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
//             whileHover={{ scale: 1.05, rotateX: 5, rotateY: 5 }}
//             className="perspective-1000"
//           >
//             <FeatureCard
//               icon={feature.icon}
//               title={feature.title}
//               description={feature.description}
//               onClick={() => handleFeatureClick(feature)}
//             />
//           </motion.div>
//         ))}
//       </div>

//       {/* Floating Explore Button */}
//       <motion.button
//         onClick={() => router.push("/chat")}
//         className="fixed bottom-8 right-8 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white flex items-center space-x-2 shadow-lg"
//         animate={{ scale: [1, 1.05, 1] }}
//         transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
//       >
//         <span>Explore Now</span>
//         <ChevronRight className="w-5 h-5" />
//       </motion.button>

//       {/* Background Effects */}
//       <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_60%)] pointer-events-none" />
//       <div className="absolute inset-0 opacity-20 pointer-events-none">
//         <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
//           <defs>
//             <filter id="noise">
//               <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
//               <feColorMatrix type="saturate" values="0" />
//               <feBlend in="SourceGraphic" mode="overlay" />
//             </filter>
//           </defs>
//           <rect width="100%" height="100%" filter="url(#noise)" fill="rgba(59,130,246,0.1)" />
//         </svg>
//       </div>
//     </div>
//   );
// }
"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import FeatureCard from "@/components/FeatureCard";
import { TrendingUp, Package2, FileSearch, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const features = [
  {
    icon: TrendingUp,
    title: "Smart Reordering 📈",
    description: "Predict reorder points with precision using trends and lead times.",
    route: "/reorder-planning",
  },
  {
    icon: Package2,
    title: "Overstock Alerts 📦",
    description: "Catch slow movers early and rebalance before they drag you down.",
    route: "/overstock",
  },
  {
    icon: FileSearch,
    title: "ABC Insights 🔍",
    description: "Rank items by usage, cost, and sales frequency—automatically.",
    route: "/abc-rank",
  },
  {
    icon: MessageCircle,
    title: "Talk to OptixAI 💬",
    description: "Upload your data and ask Optix anything about your inventory.",
    route: "/chat",
  },
];

export default function LandingComponent() {
  const router = useRouter();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "center start"],
  });
  const [hasAnimationPlayed, setHasAnimationPlayed] = useState(false);

  // Check if Hero animation has played
  useEffect(() => {
    const played = sessionStorage.getItem("introPlayed");
    setHasAnimationPlayed(played === "true");
  }, []);

  // Scroll-driven transformations
  const headerOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const gridScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]); // Reduced scaling to prevent squishing
  const gridOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  const handleFeatureClick = (feature: any) => {
    if (feature.route) {
      router.push(feature.route);
    }
  };

  return (
    <div
      ref={ref}
      className="relative min-h-[200vh] bg-gradient-to-br from-gray-900/95 to-gray-950/95 text-gray-100 flex flex-col items-center px-6 pb-48"
    >
      {/* Pulsing Background Glow */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_60%)] pointer-events-none"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
              <feBlend in="SourceGraphic" mode="overlay" />
            </filter>
          </defs>
          <rect width="100%" height="100%" filter="url(#noise)" fill="rgba(59,130,246,0.1)" />
        </svg>
      </div>

      {/* Header */}
      <motion.h2
        className="text-4xl md:text-5xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300 leading-tight mb-12 pb-4 mt-48"
        style={{ opacity: headerOpacity }}
        initial={{ opacity: hasAnimationPlayed ? 1 : 0, y: hasAnimationPlayed ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        Master Your Inventory with Optimal Inventory Intelligence
      </motion.h2>

      {/* Feature Grid Container */}
      <motion.div
        className="w-full max-w-6xl px-4 z-20"
        style={{
          scale: gridScale,
          opacity: gridOpacity,
          position: scrollYProgress.get() >= 0.2 ? "fixed" : "relative",
          top: scrollYProgress.get() >= 0.2 ? "1rem" : "auto",
          right: scrollYProgress.get() >= 0.2 ? "1rem" : "auto",
        }}
        transition={{ type: "spring", stiffness: 80, damping: 15 }}
      >
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div key={index} className="group relative">
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                onClick={() => handleFeatureClick(feature)}
                compact={scrollYProgress.get() >= 0.2}
              />
              {/* Hover Tooltip for Compact Mode */}
              <motion.div
                className="absolute top-12 left-0 hidden group-hover:block bg-gray-800/90 text-white text-sm rounded-md p-3 w-64 shadow-lg z-20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                style={{ display: scrollYProgress.get() >= 0.2 ? "block" : "none" }}
              >
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-1">{feature.description}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Transition Section */}
      <motion.section
        className="max-w-6xl w-full px-4 mt-[60vh] py-16 text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h3 className="text-3xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
          Unlock Smarter Inventory Management
        </h3>
        <p className="text-lg max-w-2xl mx-auto">
          Optix empowers small to midsize distributors with AI-driven tools to streamline operations and boost efficiency.
        </p>
        <motion.div
          className="mt-8 h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto"
          animate={{ scaleX: [1, 1.5, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
      </motion.section>

      {/* New Content Sections */}
      <div className="max-w-6xl w-full px-4 mt-16 flex flex-col items-center">
        {/* Benefits Section */}
        <section className="py-16">
          <h3 className="text-3xl font-semibold text-center mb-8">Why Choose Optix?</h3>
          <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
            <div className="p-6 bg-gray-800/50 rounded-lg">
              <h4 className="text-xl font-medium mb-2">Save Time</h4>
              <p>Automate inventory tasks and reduce manual work by up to 40%.</p>
            </div>
            <div className="p-6 bg-gray-800/50 rounded-lg">
              <h4 className="text-xl font-medium mb-2">Cut Costs</h4>
              <p>Optimize stock levels to minimize overstock and stockouts.</p>
            </div>
            <div className="p-6 bg-gray-800/50 rounded-lg">
              <h4 className="text-xl font-medium mb-2">Grow Smarter</h4>
              <p>Leverage AI insights to make data-driven decisions.</p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16">
          <h3 className="text-3xl font-semibold text-center mb-8">What Our Users Say</h3>
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
            <div className="p-6 bg-gray-800/50 rounded-lg">
              <p className="italic">"Optix cut our overstock by 25% in just three months!"</p>
              <p className="mt-4 font-semibold">- Jane, Warehouse Manager</p>
            </div>
            <div className="p-6 bg-gray-800/50 rounded-lg">
              <p className="italic">"The AI chat feature is a game-changer for quick insights."</p>
              <p className="mt-4 font-semibold">- Mark, Small Business Owner</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 text-center">
          <h3 className="text-3xl font-semibold mb-4">Ready to Transform Your Inventory?</h3>
          <p className="mb-8">Join thousands of distributors who trust Optix for smarter inventory management.</p>
          <motion.button
            onClick={() => router.push("/signup")}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white text-lg shadow-lg"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            Get Started Today
          </motion.button>
        </section>
      </div>
    </div>
  );
}