"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function FloatingSpices() {
  const particles = [
    { emoji: "🌶️", size: "text-lg", top: "10%", left: "5%", delay: 0, duration: 6 },
    { emoji: "🍃", size: "text-md", top: "25%", right: "8%", delay: 1.5, duration: 5 },
    { emoji: "🍂", size: "text-lg", top: "60%", left: "7%", delay: 0.5, duration: 7 },
    { emoji: "✨", size: "text-sm", top: "75%", right: "12%", delay: 2, duration: 4 },
    { emoji: "🌶️", size: "text-md", top: "45%", right: "4%", delay: 1, duration: 6 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p, idx) => (
        <motion.div
          key={idx}
          className={`absolute ${p.size} opacity-20`}
          style={{ top: p.top, left: p.left, right: p.right }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  );
}
