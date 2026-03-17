"use client"

import { motion } from "framer-motion"

export default function Hero() {
  return (
    <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
      
      {/* Badge */}
      <div className="mb-6">
        <span className="px-4 py-1 rounded-full bg-white/10 border border-white/20 text-sm text-gray-300">
          🚀 Minecraft Companion Platform
        </span>
      </div>

      {/* Heading */}
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-6xl font-bold leading-tight"
      >
        Master Minecraft{" "}
        <span className="bg-linear-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
          Faster
        </span>
      </motion.h1>

      {/* Subtext */}
      <p className="mt-6 text-gray-400 max-w-xl text-lg">
        Structured guides, tools, and strategies to level up your gameplay.
      </p>

      {/* Buttons */}
      <div className="mt-8 flex gap-4">
        <button className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 transition font-medium">
          Start Exploring
        </button>

        <button className="px-6 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition">
          View Guides
        </button>
      </div>
    </section>
  )
}